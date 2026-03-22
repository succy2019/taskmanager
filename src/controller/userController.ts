import { Context, Next } from "hono";
import dbClient from "../repository/database";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { generateDeterministicId } from "../utils/uuid";
import pusherService from "../services/pusherService";

function getAuthCookieOptions(c: Context) {
  const isSecureRequest = new URL(c.req.url).protocol === 'https:';

  return {
    httpOnly: true,
    secure: isSecureRequest,
    sameSite: (isSecureRequest ? 'None' : 'Lax') as 'None' | 'Lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  };
}

export const login = async (c: Context, next: Next) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ message: "email or password is empty" });
  }
  const user = await dbClient.userlogin(email, password);
  if (!user) {
    return c.json({ message: "incorrect email or password" });
  }

  try {
    const jwtSecret = c.env?.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      return c.json({ message: "Server configuration error" }, 500);
    }

    const payload = {
      id: user.userId,
      email: user.email,
    };

    const token = await sign(payload, jwtSecret, "HS256");
    setCookie(c, "authToken", token, getAuthCookieOptions(c));

    // Send login notification to admins
    await pusherService.notifyUserAction('login', user);

    return c.json(
      {
        message: "Login successful",
        user: {
          ...payload,
        },
      },
      200
    );
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ message: "Internal server error" }, 500);
  }
};

export const register = async (c: Context) => {
  try {
    const { name, email, password } = await c.req.json();
    const uid = generateDeterministicId(email); // Generate a deterministic ID based on email
    
    if (!name || !email || !password) {
      return c.json({ message: "name, email or password is empty" }, 400);
    }

    const existingUser = await dbClient.getUserByEmail(email);
    if (existingUser) {
      return c.json({ message: "User with this email already exists" }, 409);
    }

    const newUser = {
      userId: uid,
      name,
      email,
      password,
    };

    const createdUser = await dbClient.createUser(newUser);
    console.log('User registered:', createdUser);
    
    // Send registration notification to admins
    await pusherService.notifyUserAction('register', createdUser);
    
    return c.json({ message: "User registered successfully" }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ message: "Internal server error" }, 500);
  }
};

export const logout = async (c: Context) => {
  setCookie(c, "authToken", "", {
    ...getAuthCookieOptions(c),
    maxAge: 0,
  });
  return c.json({ message: "Logout successful" });
};


export const getProfile = async (c: Context) => {
  const user = c.get("user") as { id: string; email: string };
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  const userProfile = await dbClient.getUserByEmail(user.email);
  if (!userProfile) {
    return c.json({ message: "User profile not found" }, 404);
  }
  return c.json({ user: userProfile });
};
