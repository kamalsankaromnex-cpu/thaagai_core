import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AddressesService, CreateAddressDto } from "./addresses.service";
import { AuthService } from "../auth/auth.service";

@Controller("customers/me/addresses")
export class AddressesController {
  private readonly cookieName = "thaagai_customer_session";

  constructor(
    private addressesService: AddressesService,
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

  @Get()
  async listAddresses(@Req() req: Request) {
    const session = this.getSession(req);
    const addresses = await this.addressesService.listAddresses(session.customerId);
    return { success: true, addresses };
  }

  @Post()
  async createAddress(@Req() req: Request, @Body() body: CreateAddressDto) {
    const session = this.getSession(req);
    const address = await this.addressesService.createAddress(session.customerId, body);
    return { success: true, address };
  }

  @Patch(":id")
  async updateAddress(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() body: Partial<CreateAddressDto>
  ) {
    const session = this.getSession(req);
    const address = await this.addressesService.updateAddress(session.customerId, id, body);
    return { success: true, address };
  }

  @Delete(":id")
  async deleteAddress(@Req() req: Request, @Param("id") id: string) {
    const session = this.getSession(req);
    return this.addressesService.deleteAddress(session.customerId, id);
  }

  @Patch(":id/default")
  async setDefaultAddress(@Req() req: Request, @Param("id") id: string) {
    const session = this.getSession(req);
    const address = await this.addressesService.setDefaultAddress(session.customerId, id);
    return { success: true, address };
  }
}
