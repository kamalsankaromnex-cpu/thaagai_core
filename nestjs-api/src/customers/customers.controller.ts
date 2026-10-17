import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { CustomersService } from "./customers.service";
import { AuthService } from "../auth/auth.service";

@Controller("customers")
export class CustomersController {
  private readonly cookieName = "thaagai_customer_session";

  constructor(
    private customersService: CustomersService,
    private authService: AuthService
  ) {}

  private getSession(req: Request) {
    const token = req.cookies?.[this.cookieName] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const session = this.authService.verifyCustomerToken(token);
    if (!session) {
      throw new UnauthorizedException("Customer authentication required.");
    }
    return session;
  }

  @Get("me")
  async getMe(@Req() req: Request) {
    const session = this.getSession(req);
    const customer = await this.customersService.getProfile(session.customerId);
    return { success: true, customer };
  }

  @Patch("me")
  async updateMe(
    @Req() req: Request,
    @Body() body: { fullName?: string; email?: string }
  ) {
    const session = this.getSession(req);
    const updated = await this.customersService.updateProfile(session.customerId, body);
    return { success: true, customer: updated };
  }
}
