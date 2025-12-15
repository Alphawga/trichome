import { UserRole, UserStatus } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
    try {
        const { credential } = await request.json();

        if (!credential) {
            return NextResponse.json(
                { error: "No credential provided" },
                { status: 400 }
            );
        }

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return NextResponse.json(
                { error: "Invalid token payload" },
                { status: 400 }
            );
        }

        const { email, given_name, family_name, picture, sub: googleId } = payload;

        if (!email) {
            return NextResponse.json(
                { error: "No email in token" },
                { status: 400 }
            );
        }

        // Check if user exists
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: {
                    where: { provider: "google" },
                },
            },
        });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name: `${given_name || ""} ${family_name || ""}`.trim(),
                    first_name: given_name || null,
                    last_name: family_name || null,
                    image: picture || null,
                    emailVerified: new Date(),
                    role: UserRole.CUSTOMER,
                    status: UserStatus.ACTIVE,
                    last_login_at: new Date(),
                    accounts: {
                        create: {
                            type: "oauth",
                            provider: "google",
                            providerAccountId: googleId!,
                            access_token: credential,
                            token_type: "Bearer",
                        },
                    },
                },
                include: {
                    accounts: {
                        where: { provider: "google" },
                    },
                },
            });
        } else {
            // Check if Google account is linked
            const hasGoogleAccount = user.accounts.length > 0;

            if (!hasGoogleAccount) {
                // Link the Google account
                await prisma.account.create({
                    data: {
                        userId: user.id,
                        type: "oauth",
                        provider: "google",
                        providerAccountId: googleId!,
                        access_token: credential,
                        token_type: "Bearer",
                    },
                });
            }

            // Update last login timestamp and profile if needed
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    last_login_at: new Date(),
                    emailVerified: user.emailVerified || new Date(),
                    status: UserStatus.ACTIVE,
                    first_name: user.first_name || given_name || null,
                    last_name: user.last_name || family_name || null,
                    image: user.image || picture || null,
                },
            });
        }

        // Create JWT token for NextAuth session
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const token = await encode({
            token: {
                sub: user.id,
                email: user.email,
                name: user.name,
                picture: user.image,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
            },
            secret,
        });

        // Set the session cookie
        const cookieStore = await cookies();

        // Determine the cookie name based on environment
        const isProduction = process.env.NODE_ENV === "production";
        const cookieName = isProduction
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token";

        cookieStore.set(cookieName, token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                first_name: user.first_name,
                last_name: user.last_name,
            },
        });
    } catch (error) {
        console.error("Google One Tap verification error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}
