import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        mobileNumber: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    return customer;
  }

  async updateProfile(customerId: string, data: { fullName?: string; email?: string }) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName.trim() || null } : {}),
        ...(data.email !== undefined ? { email: data.email.trim() || null } : {}),
      },
      select: {
        id: true,
        mobileNumber: true,
        fullName: true,
        email: true,
        status: true,
      },
    });
  }
}
