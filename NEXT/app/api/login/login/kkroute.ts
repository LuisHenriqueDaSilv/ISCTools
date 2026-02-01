// import { NextRequest, NextResponse } from "next/server";
// // import dbClient from "@/prisma/db";
// import JWT from "@/services/JWT";
// import GoogleOauthService from "@/services/GoogleOauthService";
// // import dbClient from "../../../../../prisma/db";

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { token } = body as { token: string };

//     const googleOauthPayload = await GoogleOauthService.verifyIdToken(token);
//     if (!googleOauthPayload) {
//       return NextResponse.json(
//         { status: "error", message: "Não foi possivel validar o seu login, tente novamente mais tarde." },
//         { status: 400 }
//       );
//     }

//     let userInDb = await dbClient.user.findFirst({
//       where: { email: googleOauthPayload.email },
//     });

//     if (!userInDb) {
//       userInDb = await dbClient.user.create({
//         data: {
//           email: googleOauthPayload.email as string,
//           name: googleOauthPayload.name as string,
//         },
//       });
//     }

//     const jwtToken = await JWT.create(userInDb.id);

//     return NextResponse.json({
//       status: "success",
//       data: {
//         name: userInDb.name,
//         email: userInDb.email,
//         id: userInDb.id,
//         jwt: jwtToken,
//       },
//     });
//   } catch (error) {
//     console.error("Erro no login Google:", error);
//     return NextResponse.json(
//       { status: "error", message: "Erro interno do servidor." },
//       { status: 500 }
//     );
//   }
// }