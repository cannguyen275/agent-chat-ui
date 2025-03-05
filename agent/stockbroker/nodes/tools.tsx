import { StockbrokerState, StockbrokerUpdate } from "../types";
import { ChatOpenAI } from "@langchain/openai";
import { typedUi } from "@langchain/langgraph-sdk/react-ui/server";
import type ComponentMap from "../../uis/index";
import { z } from "zod";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { findToolCall } from "../../find-tool-call";

const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 });

const getStockPriceSchema = z.object({
  ticker: z.string().describe("The ticker symbol of the company"),
});
const getPortfolioSchema = z.object({
  get_portfolio: z.boolean().describe("Should be true."),
});

const STOCKBROKER_TOOLS = [
  {
    name: "stock-price",
    description: "A tool to get the stock price of a company",
    schema: getStockPriceSchema,
  },
  {
    name: "portfolio",
    description:
      "A tool to get the user's portfolio details. Only call this tool if the user requests their portfolio details.",
    schema: getPortfolioSchema,
  },
];

export async function callTools(
  state: StockbrokerState,
  config: LangGraphRunnableConfig,
): Promise<StockbrokerUpdate> {
  const ui = typedUi<typeof ComponentMap>(config);

  const message = await llm.bindTools(STOCKBROKER_TOOLS).invoke([
    {
      role: "system",
      content:
        "You are a stockbroker agent that uses tools to get the stock price of a company",
    },
    ...state.messages,
  ]);

  const stockbrokerToolCall = message.tool_calls?.find(
    findToolCall("stock-price")<typeof getStockPriceSchema>,
  );
  const portfolioToolCall = message.tool_calls?.find(
    findToolCall("portfolio")<typeof getStockPriceSchema>,
  );

  if (stockbrokerToolCall) {
    const instruction = `The stock price of ${
      stockbrokerToolCall.args.ticker
    } is ${Math.random() * 100}`;

    ui.write("stock-price", { instruction, logo: "hey" });
  }

  if (portfolioToolCall) {
    ui.write("portfolio", {});
  }

  return {
    messages: [message],
    ui: ui.collect as StockbrokerUpdate["ui"],
    timestamp: Date.now(),
  };
}
