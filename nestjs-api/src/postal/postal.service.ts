import { Injectable, BadRequestException } from "@nestjs/common";
import * as https from "https";

export interface PostalLookupResult {
  pinCode: string;
  state: string;
  district: string;
  city: string;
  localities: string[];
  postOffices: Array<{
    name: string;
    branchType: string;
    deliveryStatus: string;
    circle: string;
    district: string;
    division: string;
    region: string;
    state: string;
    country: string;
    pincode: string;
  }>;
}

@Injectable()
export class PostalService {
  private readonly agent = new https.Agent({
    rejectUnauthorized: process.env.NODE_ENV === "production",
  });

  isValidPin(pin: string): boolean {
    return /^[1-9][0-9]{5}$/.test((pin || "").trim());
  }

  async lookupPin(rawPin: string): Promise<PostalLookupResult> {
    const pin = (rawPin || "").trim();
    if (!this.isValidPin(pin)) {
      throw new BadRequestException("PIN code must be a valid 6-digit Indian postal code.");
    }

    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "ThaagaiStorefront/1.0",
        },
        // @ts-ignore
        agent: this.agent,
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Postal API returned ${response.status}`);
      }

      const data = await response.json();
      const firstGroup = Array.isArray(data) ? data[0] : null;

      if (!firstGroup || firstGroup.Status !== "Success" || !Array.isArray(firstGroup.PostOffice) || firstGroup.PostOffice.length === 0) {
        return {
          pinCode: pin,
          state: "",
          district: "",
          city: "",
          localities: [],
          postOffices: [],
        };
      }

      const postOffices = firstGroup.PostOffice;
      const first = postOffices[0];
      const localities = Array.from(new Set(postOffices.map((po: any) => po.Name).filter(Boolean))) as string[];

      return {
        pinCode: pin,
        state: first.State || "",
        district: first.District || "",
        city: first.District || first.Region || "",
        localities,
        postOffices: postOffices.map((po: any) => ({
          name: po.Name,
          branchType: po.BranchType,
          deliveryStatus: po.DeliveryStatus,
          circle: po.Circle,
          district: po.District,
          division: po.Division,
          region: po.Region,
          state: po.State,
          country: po.Country,
          pincode: po.Pincode,
        })),
      };
    } catch (err: any) {
      console.warn(`[PostalService] Lookup failed for PIN ${pin}:`, err?.message || err);
      return {
        pinCode: pin,
        state: "",
        district: "",
        city: "",
        localities: [],
        postOffices: [],
      };
    }
  }
}
