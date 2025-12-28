import { useState, memo, useMemo, useEffect, useCallback } from "react";
import type { Key } from "react";
import { Button, Autocomplete, AutocompleteItem } from "@heroui/react";
import { BsIncognito } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { debounce } from "lodash";
import { useClientSearch, useGenericClient } from "@/modules/sales/hooks/useSales";
import { useModal } from "@/setup/context/ModalContext";
import { ClientForm } from "@/modules/sales/components/ClientForm";
import type { Client } from "@/modules/sales/sales.type";

type ClientType = "B" | "F" | "NVT";

interface ClientSearchBarProps {
  onClientTypeChange?: (type: ClientType) => void;
  onSearch?: (value: string) => void;
  onIncognitoClick?: () => void;
  onClientSelected?: (client: Client | null) => void;
  user_id?: string | null;
}

export const ClientSearchBar = memo(
  ({
    onClientTypeChange,
    onSearch,
    onIncognitoClick,
    onClientSelected,
    user_id,
  }: ClientSearchBarProps) => {
    const { openModal } = useModal();
    const [clientType, setClientType] = useState<ClientType>("NVT");
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

    // Notificar el tipo de cliente por defecto al montar
    useEffect(() => {
      onClientTypeChange?.("NVT");
    }, []); // Solo al montar

    // Hook para buscar clientes
    const { data: clients = [], isLoading } = useClientSearch(
      searchTerm,
      searchTerm.trim().length > 0,
      user_id || null
    );

    // Hook para obtener el cliente genérico (se carga una vez y se cachea)
    const { data: genericClient } = useGenericClient(user_id || null);

    // Preparar items para el autocomplete (incluyendo opción de crear si no hay resultados)
    const autocompleteItems = useMemo(() => {
      const items: (Client | { id: "create"; name: string })[] = [...clients];
      // Si hay búsqueda pero no hay resultados, agregar opción de crear
      if (
        searchTerm.trim().length > 0 &&
        clients.length === 0 &&
        !isLoading
      ) {
        items.push({
          id: "create",
          name: `Crear "${searchTerm}"`,
        } as any);
      }
      return items;
    }, [clients, searchTerm, isLoading]);

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
          onClientSelected?.(null);
        }
      },
      [debouncedSetSearch, onSearch]
    );

    const handleSelectionChange = useCallback(
      (key: Key | null) => {
        if (key === "create") {
          // Abrir modal de creación de cliente
          if (user_id) {
            openModal?.(ClientForm, {
              searchTerm,
              user_id,
              onClientCreated: (newClient: any) => {
                // Transformar el cliente creado para compatibilidad
                const transformedClient: Client = {
                  ...newClient,
                  dni: newClient.document_number || "",
                };
                setSelectedClient(transformedClient);
                const newClientName = `${newClient.name}${newClient.last_name ? ` ${newClient.last_name}` : ""}`.toUpperCase();
                setInputValue(newClientName);
                setIsIncognitoSelected(false);
                onSearch?.(newClientName);
                onClientSelected?.(transformedClient);
              },
            });
          }
          return;
        }

        if (key && clients.length > 0) {
          const keyString = String(key);
          const client = clients.find(
            (c) => String(c.id) === keyString || String(c.dni) === keyString
          );
          if (client) {
            setSelectedClient(client);
            const clientName = `${client.name}${client.last_name ? ` ${client.last_name}` : ""}`.toUpperCase();
            setInputValue(clientName);
            setIsIncognitoSelected(false); // Deseleccionar el botón de incógnito cuando se selecciona un cliente
            onSearch?.(clientName);
            onClientSelected?.(client);
          }
        } else if (key === null) {
          setSelectedClient(null);
          setInputValue("");
          setIsIncognitoSelected(false);
          onSearch?.("");
          onClientSelected?.(null);
        }
      },
      [clients, onSearch, searchTerm, user_id, openModal]
    );

    const handleIncognitoClick = () => {
      if (isIncognitoSelected) {
        // Si ya está seleccionado, deseleccionar y limpiar
        setIsIncognitoSelected(false);
        setInputValue("");
        setSelectedClient(null);
        setSearchTerm("");
        onSearch?.("");
        onClientSelected?.(null);
      } else {
        // Si no está seleccionado, usar el cliente genérico del cache
        if (!genericClient) {
          console.warn("Cliente genérico no disponible");
          return;
        }

        setIsIncognitoSelected(true);
        setSelectedClient(genericClient);
        setInputValue(genericClient.name.toUpperCase());
        setSearchTerm("");
        onSearch?.(genericClient.name.toUpperCase());
        onClientSelected?.(genericClient);
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
            items={autocompleteItems}
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
            {(item: Client | { id: "create"; name: string }) => {
              if (item.id === "create") {
                return (
                  <AutocompleteItem
                    key="create"
                    textValue={item.name}
                    className="font-bold text-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.name}</span>
                    </div>
                  </AutocompleteItem>
                );
              }

              const client = item as Client;
              const clientFullName = `${client.name || "Sin nombre"}${client.last_name ? ` ${client.last_name}` : ""}`.toUpperCase();
              return (
                <AutocompleteItem
                  key={String(client.id || client.dni || client.document_number)}
                  textValue={client.name || client.dni || client.document_number}
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-primary">
                      {clientFullName}
                    </span>
                    {(client.dni || client.document_number) && (
                      <span className="text-xs text-secondary">
                        DNI: {client.dni || client.document_number}
                      </span>
                    )}
                  </div>
                </AutocompleteItem>
              );
            }}
          </Autocomplete>
        </div>
      </div>
    );
  }
);
