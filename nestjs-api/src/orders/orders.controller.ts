import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { OrdersService, CreateOrderDto } from "./orders.service";
import { AuthService } from "../auth/auth.service";

@Controller("orders")
export class OrdersController {
  private readonly cookieName = "thaagai_customer_session";

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService
  ) {}

  private getSession(req: Request) {
    const token = req.cookies?.[this.cookieName] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    return this.authService.verifyCustomerToken(token);
  }

  @Get()
  async getOrders(
    @Req() req: Request,
    @Query("status") status?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const session = this.getSession(req);
    if (!session) {
      throw new UnauthorizedException("Authentication required to view order history.");
    }

    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || "20", 10) || 20));

    return this.ordersService.getCustomerOrders(session.customerId, status, pageNum, limitNum);
  }

  @Post()
  async createOrder(@Req() req: Request, @Body() body: CreateOrderDto) {
    const session = this.getSession(req);
    const result = await this.ordersService.createOrderRequest(session?.customerId || null, body);
    return { success: true, ...result };
  }

  @Get(":id")
  async getOrderById(@Req() req: Request, @Param("id") id: string) {
    const session = this.getSession(req);
    if (!session) {
      throw new UnauthorizedException("Authentication required.");
    }

    const order = await this.ordersService.getCustomerOrderById(session.customerId, id);
    return { success: true, order };
  }

  @Get(":id/reorder-check")
  async reorderCheck(@Req() req: Request, @Param("id") id: string) {
    const session = this.getSession(req);
    if (!session) {
      throw new UnauthorizedException("Authentication required.");
    }

    const result = await this.ordersService.validateReorder(session.customerId, id);
    return { success: true, ...result };
  }
}
