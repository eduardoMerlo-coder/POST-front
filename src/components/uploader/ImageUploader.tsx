import { type ChangeEvent, useRef, useState } from "react";
import { XIcon, ImageIcon, PlusIcon } from "@/Icons";
import { useFieldArray, type Control } from "react-hook-form";
import type { ProductForm } from "@/modules/product/pages/NewProduct";
import { supabase } from "@/lib/supabaseClient";

export type FileProps = {
  id: string;
  file: File;
  url: string;
};

export const ImageUploader = ({ control }: { control: Control<any> }) => {
  const [uploading, setUploading] = useState(false);
  const { fields, remove, append } = useFieldArray<ProductForm>({
    control,
    name: "images",
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) {
      return;
    }

    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      url: "",
      id: file.name,
    }));

    setUploading(true);
    const uploadedFiles = await Promise.allSettled(
      newFiles.map(async (f) => {
        const filePath = `${Date.now()}-${f.file.name}`;
        const { error } = await supabase.storage
          .from("pos")
          .upload(filePath, f.file);
        if (error) throw error;

        const { data: publicData } = await supabase.storage
          .from("pos")
          .getPublicUrl(filePath);
        return {
          ...f,
          url: publicData.publicUrl,
        };
      })
    );

    const successful = uploadedFiles
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<FileProps>).value);

    append(successful);
    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <h2 className="text-xl font-bold">Subir imagenes</h2>
      <div className="flex gap-2">
        <FileInput
          inputRef={inputRef}
          disabled={uploading}
          onFileSelect={handleFileSelect}
        />
      </div>
      <FileList files={fields} remove={remove} uploading={uploading} />
    </div>
  );
};

type FileInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
};

function FileInput({ inputRef, disabled, onFileSelect }: FileInputProps) {
  return (
    <>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileSelect}
        multiple
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className="flex cursor-pointer items-center gap-2 rounded-md bg-zinc-300 px-6 py-2 hover:opacity-90"
      >
        <PlusIcon className={"size-5"} />
        Subir Imagenes
      </label>
    </>
  );
}

type FileListProps = {
  files: FileProps[];
  remove: any;
  uploading: boolean;
};

function FileList({ files, remove, uploading }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 w-full">
      <h3 className="font-semibold">Files:</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <FileItem
            key={file.id}
            file={file}
            onRemove={() => remove(index)}
            uploading={uploading}
          />
        ))}
      </div>
    </div>
  );
}

type FileItemProps = {
  file: FileProps;
  onRemove: () => void;
  uploading: boolean;
};

function FileItem({ file, onRemove, uploading }: FileItemProps) {
  return (
    <div className="space-y-2 rounded-md bg-zinc-100 p-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-primary-500 size-5" />
          <div className="flex flex-col">
            <span className="font-medium text-xs w-40 truncate">
              {file.file.name}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-grayscale-400">
              <span>{formatFileSize(file.file.size)}</span>
              <span>•</span>
              <span>{file.file.type || "Unknown type"}</span>
            </div>
          </div>
        </div>
        {!uploading && (
          <button onClick={onRemove} className="bg-none p-0 ">
            <XIcon className="text-zinc-400 size-6 cursor-pointer" />
          </button>
        )}
      </div>
    </div>
  );
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
