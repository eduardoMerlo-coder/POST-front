import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "@/components/ui/provider";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const queryClient = new QueryClient();
const insertionPoint = document.querySelector(
  'meta[name="emotion-insertion-point"]'
) as HTMLElement | null;
const emotionCache = createCache({
  key: "chakra",
  insertionPoint: insertionPoint ?? undefined,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CacheProvider value={emotionCache}>
      <Provider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    </CacheProvider>
  </StrictMode>
);
