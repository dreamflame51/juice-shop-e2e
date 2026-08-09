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

const ENDPOINTS = {
  users: "/api/Users/",
  login: "/rest/user/login",
  basketItems: "/api/BasketItems/",
  basket: (basketId: number) => `/rest/basket/${basketId}`,
  addresses: "/api/Addresss/",
  cards: "/api/Cards/",
  checkout: (basketId: number) => `/rest/basket/${basketId}/checkout`,
} as const;

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
      await this.call(`POST ${ENDPOINTS.users}`, data, () =>
        this.request.post(ENDPOINTS.users, { data }),
      ),
    );
  }

  loginRaw(email: string, password: string): Promise<APIResponse> {
    return this.call(`POST ${ENDPOINTS.login}`, { email, password }, () =>
      this.request.post(ENDPOINTS.login, { data: { email, password } }),
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

  addToBasketRaw(
    basketId: number,
    productId: number,
    quantity: number,
  ): Promise<APIResponse> {
    const data = { BasketId: basketId, ProductId: productId, quantity };
    return this.call(`POST ${ENDPOINTS.basketItems}`, data, () =>
      this.request.post(ENDPOINTS.basketItems, { headers: this.authHeaders, data }),
    );
  }

  async addToBasket(
    basketId: number,
    productId: number,
    quantity: number,
  ): Promise<void> {
    await json(await this.addToBasketRaw(basketId, productId, quantity));
  }

  getBasketRaw(basketId: number): Promise<APIResponse> {
    return this.call(`GET ${ENDPOINTS.basket(basketId)}`, undefined, () =>
      this.request.get(ENDPOINTS.basket(basketId), { headers: this.authHeaders }),
    );
  }

  async getBasket(basketId: number): Promise<BasketProduct[]> {
    const body = await json<{ data: { Products: BasketProduct[] } }>(
      await this.getBasketRaw(basketId),
    );
    return body.data.Products;
  }

  async createAddress(address: TestAddress): Promise<number> {
    const body = await json<{ data: { id: number } }>(
      await this.call(`POST ${ENDPOINTS.addresses}`, address, () =>
        this.request.post(ENDPOINTS.addresses, { headers: this.authHeaders, data: address }),
      ),
    );
    return body.data.id;
  }

  async createCard(card: TestCard): Promise<number> {
    const body = await json<{ data: { id: number } }>(
      await this.call(`POST ${ENDPOINTS.cards}`, card, () =>
        this.request.post(ENDPOINTS.cards, { headers: this.authHeaders, data: card }),
      ),
    );
    return body.data.id;
  }

  checkoutRaw(
    basketId: number,
    orderDetails: OrderDetails,
  ): Promise<APIResponse> {
    const data = { couponData: "", orderDetails };
    return this.call(`POST ${ENDPOINTS.checkout(basketId)}`, data, () =>
      this.request.post(ENDPOINTS.checkout(basketId), { headers: this.authHeaders, data }),
    );
  }

  async checkout(
    basketId: number,
    orderDetails: OrderDetails,
  ): Promise<string> {
    const body = await json<{ orderConfirmation: string }>(
      await this.checkoutRaw(basketId, orderDetails),
    );
    return body.orderConfirmation;
  }
}
