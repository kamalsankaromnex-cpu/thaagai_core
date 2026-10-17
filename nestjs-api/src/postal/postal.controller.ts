import { Controller, Get, Param } from "@nestjs/common";
import { PostalService } from "./postal.service";

@Controller("postal-codes")
export class PostalController {
  constructor(private readonly postalService: PostalService) {}

  @Get(":pin")
  async getPinDetails(@Param("pin") pin: string) {
    const details = await this.postalService.lookupPin(pin);
    return { success: true, ...details };
  }
}
