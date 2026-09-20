import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password, orgName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Every new user automatically gets their own organization, with
    // themselves as ADMIN. This is what makes multi-tenancy possible -
    // more organizations can be created later, and other people can be
    // invited into this one.
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const organization = await prisma.organization.create({
      data: {
        name: orgName?.trim() || `${name}'s Team`,
        plan: "FREE",
        memberships: {
          create: { userId: user.id, role: "ADMIN" },
        },
      },
    });

    const token = signToken({ userId: user.id });
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      organizationId: organization.id,
    });
    setAuthCookie(response, token);
    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
