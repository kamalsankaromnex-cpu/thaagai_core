import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateAddressDto {
  recipientName: string;
  mobileNumber: string;
  houseOrFlat: string;
  buildingName?: string;
  street: string;
  locality?: string;
  landmark?: string;
  pinCode: string;
  postOffice?: string;
  city: string;
  district?: string;
  state: string;
  country?: string;
  addressType?: "HOME" | "WORK" | "OTHER";
  isDefault?: boolean;
}

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  async listAddresses(customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async createAddress(customerId: string, dto: CreateAddressDto) {
    if (!dto.recipientName?.trim()) throw new BadRequestException("Recipient name is required.");
    if (!dto.mobileNumber?.trim()) throw new BadRequestException("Mobile number is required.");
    if (!dto.houseOrFlat?.trim()) throw new BadRequestException("House/Flat number is required.");
    if (!dto.street?.trim()) throw new BadRequestException("Street/Road name is required.");
    if (!dto.city?.trim()) throw new BadRequestException("City is required.");
    if (!dto.state?.trim()) throw new BadRequestException("State is required.");
    if (!/^[1-9][0-9]{5}$/.test((dto.pinCode || "").trim())) {
      throw new BadRequestException("A valid 6-digit PIN code is required.");
    }

    const count = await this.prisma.customerAddress.count({ where: { customerId } });
    const isDefault = count === 0 ? true : Boolean(dto.isDefault);

    if (isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        customerId,
        recipientName: dto.recipientName.trim(),
        mobileNumber: dto.mobileNumber.replace(/\D/g, "").slice(-10),
        houseOrFlat: dto.houseOrFlat.trim(),
        buildingName: dto.buildingName?.trim() || null,
        street: dto.street.trim(),
        locality: dto.locality?.trim() || null,
        landmark: dto.landmark?.trim() || null,
        pinCode: dto.pinCode.trim(),
        postOffice: dto.postOffice?.trim() || null,
        city: dto.city.trim(),
        district: dto.district?.trim() || null,
        state: dto.state.trim(),
        country: dto.country?.trim() || "India",
        addressType: dto.addressType || "HOME",
        isDefault,
      },
    });
  }

  async updateAddress(customerId: string, addressId: string, dto: Partial<CreateAddressDto>) {
    const existing = await this.prisma.customerAddress.findUnique({ where: { id: addressId } });
    if (!existing) throw new NotFoundException("Address not found.");
    if (existing.customerId !== customerId) throw new ForbiddenException("Unauthorized to modify this address.");

    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: {
        ...(dto.recipientName ? { recipientName: dto.recipientName.trim() } : {}),
        ...(dto.mobileNumber ? { mobileNumber: dto.mobileNumber.replace(/\D/g, "").slice(-10) } : {}),
        ...(dto.houseOrFlat ? { houseOrFlat: dto.houseOrFlat.trim() } : {}),
        ...(dto.buildingName !== undefined ? { buildingName: dto.buildingName?.trim() || null } : {}),
        ...(dto.street ? { street: dto.street.trim() } : {}),
        ...(dto.locality !== undefined ? { locality: dto.locality?.trim() || null } : {}),
        ...(dto.landmark !== undefined ? { landmark: dto.landmark?.trim() || null } : {}),
        ...(dto.pinCode ? { pinCode: dto.pinCode.trim() } : {}),
        ...(dto.postOffice !== undefined ? { postOffice: dto.postOffice?.trim() || null } : {}),
        ...(dto.city ? { city: dto.city.trim() } : {}),
        ...(dto.district !== undefined ? { district: dto.district?.trim() || null } : {}),
        ...(dto.state ? { state: dto.state.trim() } : {}),
        ...(dto.country ? { country: dto.country.trim() } : {}),
        ...(dto.addressType ? { addressType: dto.addressType } : {}),
        ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
      },
    });
  }

  async deleteAddress(customerId: string, addressId: string) {
    const existing = await this.prisma.customerAddress.findUnique({ where: { id: addressId } });
    if (!existing) throw new NotFoundException("Address not found.");
    if (existing.customerId !== customerId) throw new ForbiddenException("Unauthorized to delete this address.");

    await this.prisma.customerAddress.delete({ where: { id: addressId } });

    if (existing.isDefault) {
      const remaining = await this.prisma.customerAddress.findFirst({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await this.prisma.customerAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  }

  async setDefaultAddress(customerId: string, addressId: string) {
    const existing = await this.prisma.customerAddress.findUnique({ where: { id: addressId } });
    if (!existing) throw new NotFoundException("Address not found.");
    if (existing.customerId !== customerId) throw new ForbiddenException("Unauthorized to modify this address.");

    await this.prisma.customerAddress.updateMany({
      where: { customerId },
      data: { isDefault: false },
    });

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  }
}
