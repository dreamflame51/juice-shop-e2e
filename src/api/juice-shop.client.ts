import type { APIRequestContext, APIResponse } from "@playwright/test";

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

  async register(user: TestUser): Promise<void> {
    await json(
      await this.request.post("/api/Users/", {
        data: {
          email: user.email,
          password: user.password,
          passwordRepeat: user.password,
          securityQuestion: { id: 1 },
          securityAnswer: user.securityAnswer,
        },
      }),
    );
  }

  loginRaw(email: string, password: string): Promise<APIResponse> {
    return this.request.post("/rest/user/login", { data: { email, password } });
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
    await json(
      await this.request.post("/api/BasketItems/", {
        headers: this.authHeaders,
        data: { BasketId: basketId, ProductId: productId, quantity },
      }),
    );
  }

  async getBasket(basketId: number): Promise<BasketProduct[]> {
    const body = await json<{ data: { Products: BasketProduct[] } }>(
      await this.request.get(`/rest/basket/${basketId}`, {
        headers: this.authHeaders,
      }),
    );
    return body.data.Products;
  }

  async createAddress(fullName: string): Promise<number> {
    const body = await json<{ data: { id: number } }>(
      await this.request.post("/api/Addresss/", {
        headers: this.authHeaders,
        data: {
          fullName,
          mobileNum: 1234567890,
          zipCode: "12345",
          streetAddress: "1 Test Street",
          city: "Testville",
          state: "TS",
          country: "Testland",
        },
      }),
    );
    return body.data.id;
  }

  async createCard(fullName: string): Promise<number> {
    const body = await json<{ data: { id: number } }>(
      await this.request.post("/api/Cards/", {
        headers: this.authHeaders,
        data: {
          fullName,
          cardNum: "4111111111111111",
          expMonth: 12,
          expYear: 2080,
        },
      }),
    );
    return body.data.id;
  }

  async checkout(
    basketId: number,
    orderDetails: OrderDetails,
  ): Promise<string> {
    const body = await json<{ orderConfirmation: string }>(
      await this.request.post(`/rest/basket/${basketId}/checkout`, {
        headers: this.authHeaders,
        data: { couponData: "", orderDetails },
      }),
    );
    return body.orderConfirmation;
  }
}
