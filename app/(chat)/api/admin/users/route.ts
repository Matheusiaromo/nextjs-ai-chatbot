import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import {
  createUserByAdmin,
  deleteUserById,
  getAllUsers,
  updateUserRole,
} from "@/lib/db/queries";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new ChatSDKError("unauthorized:chat");
  }

  if (session.user.type !== "admin") {
    throw new ChatSDKError("forbidden:chat");
  }

  return session;
}

export async function GET() {
  try {
    await requireAdmin();
    const users = await getAllUsers();
    return Response.json(users);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const created = await createUserByAdmin({
      email,
      password,
      role: role ?? "regular",
    });

    return Response.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { message: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { id, role } = await request.json();

    if (!id || !role) {
      return Response.json(
        { message: "User id and role are required" },
        { status: 400 },
      );
    }

    const updated = await updateUserRole({ id, role });
    return Response.json(updated);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { message: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();
    const { id } = await request.json();

    if (!id) {
      return Response.json(
        { message: "User id is required" },
        { status: 400 },
      );
    }

    if (id === session.user.id) {
      return Response.json(
        { message: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    const deleted = await deleteUserById({ id });
    return Response.json(deleted);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { message: "Failed to delete user" },
      { status: 500 },
    );
  }
}
