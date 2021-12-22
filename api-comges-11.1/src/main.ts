import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cron from "node-cron";
//import enviarMail from "./utilities/enviarMail";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

const enviarMail = async () => {
  console.log(process.env.MAIL_NAME);
  await fetch(`http://localhost:3001/email/emailDesam`, {
    method: "GET",
  });
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);

  /*
  cron.schedule("* * * * *", () => {
    enviarMail();
  });
  */
}
bootstrap();
