import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { OtpService } from "./otp.service";

@Controller("auth")
export class AuthController {
  private readonly cookieName = "thaagai_customer_session";

  constructor(
    private authService: AuthService,
    private otpService: OtpService
  ) {}

  @Post("otp/request")
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body("mobileNumber") mobileNumber: string) {
    return this.otpService.requestOtp(mobileNumber);
  }

  @Post("otp/verify")
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body("mobileNumber") mobileNumber: string,
    @Body("otp") otp: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { token, customer } = await this.authService.loginWithOtp(mobileNumber, otp);

    res.cookie(this.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return {
      success: true,
      customer: {
        id: customer.id,
        mobileNumber: customer.mobileNumber,
        fullName: customer.fullName,
        email: customer.email,
      },
    };
  }

  @Get("session")
  async getSession(@Req() req: Request) {
    const token = req.cookies?.[this.cookieName];
    return this.authService.getSession(token);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(this.cookieName, { path: "/" });
    return { success: true };
  }
}
