import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CustomersModule } from "./customers/customers.module";
import { AddressesModule } from "./addresses/addresses.module";
import { PostalModule } from "./postal/postal.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CustomersModule,
    AddressesModule,
    PostalModule,
    OrdersModule,
  ],
})
export class AppModule {}
