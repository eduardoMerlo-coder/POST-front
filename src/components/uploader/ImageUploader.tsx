import { CameraIcon } from "@/Icons";
import { Box, FileUpload, Icon } from "@chakra-ui/react";

export const ImageUploader = () => {
  return (
    <FileUpload.Root maxW="xl" alignItems="stretch" maxFiles={4}>
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
          <CameraIcon />
        </Icon>
        <FileUpload.DropzoneContent>
          <Box>Arrastra imagenes aqui </Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  );
};
