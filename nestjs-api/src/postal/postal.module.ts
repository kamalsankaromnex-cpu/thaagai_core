import { Module } from "@nestjs/common";
import { PostalController } from "./postal.controller";
import { PostalService } from "./postal.service";

@Module({
  controllers: [PostalController],
  providers: [PostalService],
  exports: [PostalService],
})
export class PostalModule {}
