import {
    Box,
    Button,
    ButtonGroup,
    Flex,
    IconButton,
    Popover,
    PopoverArrow,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
  } from "@chakra-ui/react";

  import { FaArrowRotateRight } from "react-icons/fa6";
  import { FaArrowRotateLeft } from "react-icons/fa6";  


const ToolBox = ({undo,redo,currentStep,PAINT_OPTIONS,setDrawAction,drawAction,color,setColor,onClear,fileRef,onImportImageSelect,onImportImageClick,onExportClick,isMobile,isOpen}) => {
  return (
    <>
     <Flex position={"absolute"} gap={"20px"} px={"10px"} py={"5px"} backgroundColor={"gray.300"} borderRadius={"9px"} mt={9} left={"50%"}  transform="translateX(-50%)" zIndex={"30"} justifyContent={"space-between"} alignItems="center" flexDirection={isMobile ? "column" : "row"}>
        <ButtonGroup size="sm" isAttached variant="solid">

        <IconButton aria-label={"Undo"} icon={<FaArrowRotateRight />} onClick={undo} isDisabled={currentStep <= 0} />
        <IconButton aria-label={"Redo"} icon={<FaArrowRotateLeft />} onClick={redo} isDisabled={currentStep >= history.length - 1} />

          {PAINT_OPTIONS.map(({ id, label, icon }) => (
            <IconButton
              aria-label={label}
              icon={icon}
              onClick={() => setDrawAction(id)}
              colorScheme={id === drawAction ? "whatsapp" : undefined}
            />
          ))}
          <Popover>
            <PopoverTrigger>
              <Box
                bg={color}
                h={"32px"}
                w={"32px"}
                borderRadius="sm"
                cursor="pointer"
              ></Box>
            </PopoverTrigger>
            <PopoverContent width="300">
              <PopoverArrow />
              <PopoverCloseButton />
              {/*@ts-ignore*/}
              <SketchPicker
                color={color}
                onChangeComplete={(selectedColor) =>
                  setColor(selectedColor.hex)
                }
              />
            </PopoverContent>
          </Popover>
          <IconButton aria-label={"Clear"} icon={<XLg />} onClick={onClear} />
        </ButtonGroup>
        <Flex gap={4} alignItems="center" height="100%">
          <input
            type="file"
            ref={fileRef}
            onChange={onImportImageSelect}
            style={{ display: "none" }}
            accept="image/*"
          />
          <Button
            leftIcon={<Upload />}
            variant="solid"
            onClick={onImportImageClick}
            size="sm"
          >
            Import Image
          </Button>
          <Button
            backgroundColor={"green.400"}
            leftIcon={<Download />}
            colorScheme="whatsapp"
            variant="solid"
            onClick={onExportClick}
            size="sm"
          >
            Export
          </Button>
        </Flex>
      </Flex> 
    </>
  )
}

export default ToolBox
