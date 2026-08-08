import type { APIRequestContext, APIResponse } from "@playwright/test";
import * as allure from "allure-js-commons";
import { ContentType } from "allure-js-commons";

import type { TestAddress } from "../data/address.factory";
import type { TestCard } from "../data/card.factory";
import type { TestUser } from "../data/user.factory";

export interface AuthSession {
  token: string;
  basketId: number;
}

export interface BasketProduct {
  id: number;
  name: string;
  price: number;
  BasketItem: { quantity: number };
}

export interface OrderDetails {
  addressId: number;
  paymentId: number;
  deliveryMethodId: number;
}

async function json<T>(response: APIResponse): Promise<T> {
  if (!response.ok()) {
    throw new Error(
      `${response.url()} -> ${response.status()}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}

export class JuiceShopClient {
  constructor(
    private readonly request: APIRequestContext,
    private token?: string,
  ) {}

  private get authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  /** Runs an API call inside an Allure step, attaching request/response payloads. */
  private async call(
    stepName: string,
    requestBody: unknown,
    fn: () => Promise<APIResponse>,
  ): Promise<APIResponse> {
    return allure.step(stepName, async () => {
      if (requestBody !== undefined) {
        await allure.attachment(
          "Request",
          JSON.stringify(requestBody, null, 2),
          ContentType.JSON,
        );
      }
      const response = await fn();
      await allure.attachment(
        "Response",
        `${response.status()} ${response.url()}\n${await response.text()}`,
        ContentType.TEXT,
      );
      return response;
    });
  }

  async register(user: TestUser): Promise<void> {
    const data = {
      email: user.email,
      password: user.password,
      passwordRepeat: user.password,
      securityQuestion: { id: 1 },
      securityAnswer: user.securityAnswer,
    };
    await json(
      await this.call("POST /api/Users/", data, () =>
        this.request.post("/api/Users/", { data }),
      ),
    );
  }

  loginRaw(email: string, password: string): Promise<APIResponse> {
    return this.call("POST /rest/user/login", { email, password }, () =>
      this.request.post("/rest/user/login", { data: { email, password } }),
    );
  }

  async login(user: TestUser): Promise<AuthSession> {
    const body = await json<{ authentication: { token: string; bid: number } }>(
      await this.loginRaw(user.email, user.password),
    );
    this.token = body.authentication.token;
    return {
      token: body.authentication.token,
      basketId: body.authentication.bid,
    };
  }

  async addToBasket(
    basketId: number,
    productId: number,
    quantity: number,
  ): Promise<void> {
    const data = { BasketId: basketId, ProductId: productId, quantity };
    await json(
      await this.call("POST /api/BasketItems/", data, () =>
        this.request.post("/api/BasketItems/", { headers: this.authHeaders, data }),
      ),
    );
  }

  async getBasket(basketId: number): Promise<BasketProduct[]> {
    const body = await json<{ data: { Products: BasketProduct[] } }>(
      await this.call(`GET /rest/basket/${basketId}`, undefined, () =>
        this.request.get(`/rest/basket/${basketId}`, { headers: this.authHeaders }),
      ),
    );
    return body.data.Products;
  }

  async createAddress(address: TestAddress): Promise<number> {
    const body = await json<{ data: { id: number } }>(
      await this.call("POST /api/Addresss/", address, () =>
        this.request.post("/api/Addresss/", { headers: this.authHeaders, data: address }),
      ),
    );
    return body.data.id;
  }

  async createCard(card: TestCard): Promise<number> {
    const body = await json<{ data: { id: number } }>(
      await this.call("POST /api/Cards/", card, () =>
        this.request.post("/api/Cards/", { headers: this.authHeaders, data: card }),
      ),
    );
    return body.data.id;
  }

  async checkout(
    basketId: number,
    orderDetails: OrderDetails,
  ): Promise<string> {
    const data = { couponData: "", orderDetails };
    const body = await json<{ orderConfirmation: string }>(
      await this.call(`POST /rest/basket/${basketId}/checkout`, data, () =>
        this.request.post(`/rest/basket/${basketId}/checkout`, { headers: this.authHeaders, data }),
      ),
    );
    return body.orderConfirmation;
  }
}
