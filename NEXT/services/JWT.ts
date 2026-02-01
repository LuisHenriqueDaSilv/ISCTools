import { SignJWT, jwtVerify, JWTPayload } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY as string);

class JWTService {
    // Cria um token JWT com 24h de validade
    async create(userId: string): Promise<string> {
        const token = await new SignJWT({ id: userId })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(secret);

        return token;
    }

    // Valida o token e retorna o payload ou null se inválido
    async validate(token: string): Promise<JWTPayload | null> {
        try {
            const { payload } = await jwtVerify(token, secret);
            return payload;
        } catch (err) {
            console.error("Falha ao validar token:", err);
            return null;
        }
    }
}

export default new JWTService();