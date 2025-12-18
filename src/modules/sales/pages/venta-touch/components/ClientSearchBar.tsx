import { useState, memo, useMemo, useEffect, useCallback } from "react";
import type { Key } from "react";
import { Button, Autocomplete, AutocompleteItem } from "@heroui/react";
import { BsIncognito } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { debounce } from "lodash";
import { useClientSearch } from "../../../hooks/useSales";
import type { Client } from "../../../sales.type";

type ClientType = "B" | "F" | "NVT";

interface ClientSearchBarProps {
  onClientTypeChange?: (type: ClientType) => void;
  onSearch?: (value: string) => void;
  onIncognitoClick?: () => void;
}

export const ClientSearchBar = memo(
  ({
    onClientTypeChange,
    onSearch,
    onIncognitoClick,
  }: ClientSearchBarProps) => {
    const [clientType, setClientType] = useState<ClientType>("B");
    const [inputValue, setInputValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isIncognitoSelected, setIsIncognitoSelected] = useState(false);

    // Debounce para el término de búsqueda
    const debouncedSetSearch = useMemo(
      () => debounce((value: string) => setSearchTerm(value), 300),
      []
    );

    // Cleanup del debounce al desmontar
    useEffect(() => {
      return () => {
        debouncedSetSearch.cancel();
      };
    }, [debouncedSetSearch]);

    // Hook para buscar clientes
    const { data: clients = [], isLoading } = useClientSearch(
      searchTerm,
      searchTerm.trim().length > 0
    );

    const cycleClientType = () => {
      const nextType: ClientType =
        clientType === "B" ? "F" : clientType === "F" ? "NVT" : "B";
      setClientType(nextType);
      onClientTypeChange?.(nextType);
    };

    const handleInputChange = useCallback(
      (value: string) => {
        setInputValue(value);
        debouncedSetSearch(value);
        // Si se borra el input, limpiar la selección y el botón de incógnito
        if (!value.trim()) {
          setSelectedClient(null);
          setIsIncognitoSelected(false);
          onSearch?.("");
        }
      },
      [debouncedSetSearch, onSearch]
    );

    const handleSelectionChange = useCallback(
      (key: Key | null) => {
        if (key && clients.length > 0) {
          const keyString = String(key);
          const client = clients.find(
            (c) => String(c.id) === keyString || String(c.dni) === keyString
          );
          if (client) {
            setSelectedClient(client);
            setInputValue(client.name || client.dni);
            setIsIncognitoSelected(false); // Deseleccionar el botón de incógnito cuando se selecciona un cliente
            onSearch?.(client.name || client.dni);
          }
        } else if (key === null) {
          setSelectedClient(null);
          setInputValue("");
          setIsIncognitoSelected(false);
          onSearch?.("");
        }
      },
      [clients, onSearch]
    );

    const handleIncognitoClick = () => {
      if (isIncognitoSelected) {
        // Si ya está seleccionado, deseleccionar y limpiar
        setIsIncognitoSelected(false);
        setInputValue("");
        setSelectedClient(null);
        setSearchTerm("");
        onSearch?.("");
      } else {
        // Si no está seleccionado, seleccionar y establecer cliente genérico
        const genericClient = "CLIENTE GENERICO";
        setIsIncognitoSelected(true);
        setInputValue(genericClient);
        setSelectedClient(null);
        setSearchTerm("");
        onSearch?.(genericClient);
        onIncognitoClick?.();
      }
    };

    const getClientTypeLabel = (type: ClientType): string => {
      switch (type) {
        case "B":
          return "B";
        case "F":
          return "F";
        case "NVT":
          return "NVT";
        default:
          return "B";
      }
    };

    return (
      <div className="bg-base-alt rounded-lg p-3 shadow-sm">
        <div className="flex justify-between items-center gap-3 h-full">
          {/* Desktop: Tres botones separados */}
          <div className="hidden md:flex gap-2 h-full">
            <Button
              variant="bordered"
              color={clientType === "B" ? "primary" : "default"}
              className={`${
                clientType === "B"
                  ? "bg-accent text-white border-accent font-semibold"
                  : "border-1 border-secondary font-semibold bg-transparent"
              } min-w-[60px] h-full`}
              radius="sm"
              onPress={() => {
                setClientType("B");
                onClientTypeChange?.("B");
              }}
            >
              B
            </Button>
            <Button
              variant="bordered"
              color={clientType === "F" ? "primary" : "default"}
              className={`${
                clientType === "F"
                  ? "bg-accent text-white border-accent font-semibold"
                  : "border-1 border-secondary font-semibold bg-transparent"
              } min-w-[60px] h-full`}
              radius="sm"
              onPress={() => {
                setClientType("F");
                onClientTypeChange?.("F");
              }}
            >
              F
            </Button>
            <Button
              variant="bordered"
              color={clientType === "NVT" ? "primary" : "default"}
              className={`${
                clientType === "NVT"
                  ? "bg-accent text-white border-accent font-semibold"
                  : "border-1 border-secondary font-semibold bg-transparent"
              } min-w-[80px] h-full`}
              radius="sm"
              onPress={() => {
                setClientType("NVT");
                onClientTypeChange?.("NVT");
              }}
            >
              NVT
            </Button>
          </div>

          {/* Mobile: Un solo botón que cicla */}
          <Button
            variant="bordered"
            className="md:hidden border-1 border-secondary font-semibold min-w-[60px] h-10 text-sm"
            radius="md"
            size="sm"
            onPress={cycleClientType}
          >
            {getClientTypeLabel(clientType)}
          </Button>

          <Autocomplete
            placeholder="Buscar cliente"
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSelectionChange={handleSelectionChange}
            selectedKey={
              selectedClient
                ? String(selectedClient.id || selectedClient.dni)
                : null
            }
            isLoading={isLoading}
            items={clients}
            allowsCustomValue={false}
            startContent={
              <HiMagnifyingGlass className="text-secondary text-lg" />
            }
            endContent={
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className={`min-w-0 w-8 h-8 transition-colors ${
                  isIncognitoSelected
                    ? "bg-accent/20 hover:bg-accent/30"
                    : "bg-transparent hover:bg-surface-alt"
                }`}
                onPress={handleIncognitoClick}
              >
                <BsIncognito
                  size={28}
                  className={`text-lg transition-colors ${
                    isIncognitoSelected ? "text-accent" : "text-secondary"
                  }`}
                />
              </Button>
            }
            classNames={{
              base: "[&_[data-slot=input-wrapper]]:bg-surface [&_[data-slot=input-wrapper]]:!h-12 [&_[data-slot=input-wrapper]]:border-1 [&_[data-slot=input-wrapper]]:border-border [&_[data-slot=input-wrapper]:hover]:bg-surface",
              //inputWrapper:
              //"border-1 border-border hover:border-accent focus-within:border-accent transition-colors h-10 bg-surface",
              //input: "text-sm text-primary",
              listboxWrapper: "bg-surface-alt rounded-lg",
              listbox: "bg-surface-alt rounded-lg",
            }}
            radius="sm"
            size="md"
          >
            {(client: Client) => (
              <AutocompleteItem
                key={String(client.id || client.dni)}
                textValue={client.name || client.dni}
              >
                <div className="flex flex-col">
                  <span className="text-sm text-primary">
                    {client.name || "Sin nombre"}
                  </span>
                  <span className="text-xs text-secondary">
                    DNI: {client.dni}
                  </span>
                </div>
              </AutocompleteItem>
            )}
          </Autocomplete>
        </div>
      </div>
    );
  }
);
