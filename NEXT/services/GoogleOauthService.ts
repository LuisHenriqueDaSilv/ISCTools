import { OAuth2Client, TokenPayload } from 'google-auth-library';
import "dotenv/config"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;

class GoogleOauth {
  client: OAuth2Client

  constructor(CLIENT_ID: string) {
    this.client = new OAuth2Client(CLIENT_ID);
  };

  async verifyIdToken(idToken: string): Promise<TokenPayload|undefined>{
    try {

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      return payload;
    } catch {
      return undefined
    }
  }
}

export default new GoogleOauth(GOOGLE_CLIENT_ID)