import { 
  Text, 
  Box, 
  Center, 
  Heading, 
  Button, 
  VStack, 
  Container,
  Flex
} from "@yamada-ui/react";

const App = () => {
  return (
    <Box 
      w="100%" 
      h="100vh" 
      bg={{ base: "gray.50", dark: "black" }}
      py={{ base: "10", md: "20" }}
      color="gray.800"
    >
      <Center h="full">
        <Container maxW={{ base: "50%", md: "50%", lg: "50%" }} p="0">
          <Box 
            textAlign="center" 
            p={{ base: "8", md: "12" }} 
            borderRadius="3xl" 
            boxShadow="sm"
            bg="white"
          >
            <VStack gap={{ base: "6", md: "8" }}>
              <Heading 
                as="h1" 
                size={{ base: "xl", md: "2xl" }}
                fontWeight="light"
                letterSpacing="tight"
              >
                Survey AI
              </Heading>
              
              <Text 
                fontSize={{ base: "xs", md: "sm" }}
                color="gray.500" 
                letterSpacing="wider"
                textTransform="uppercase"
                mb="8"
              >
                デモ版
              </Text>
              
              <Flex 
                w="full" 
                direction={{ base: "column", md: "row" }} 
                gap={{ base: "4", md: "6" }}
                justify="center"
              >
                <Button 
                  as="a" 
                  href="/auth/login/" 
                  size={{ base: "md", md: "lg" }}
                  w={{ base: "full", md: "auto" }}
                  px={{ base: "6", md: "10" }}
                  py={{ base: "5", md: "6" }}
                  bg="gray.800"
                  color="white"
                  borderRadius="full"
                  _hover={{ bg: "gray.700", transform: "translateY(-2px)" }}
                  transition="all 0.3s"
                  fontWeight="medium"
                  letterSpacing={{ base: "normal", md: "wide" }}
                  boxShadow="none"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  ログイン
                </Button>
                
                <Button 
                  as="a" 
                  href="/auth/signup/" 
                  size={{ base: "md", md: "lg" }}
                  w={{ base: "full", md: "auto" }}
                  px={{ base: "6", md: "10" }}
                  py={{ base: "5", md: "6" }}
                  bg="white"
                  color="gray.800"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="gray.200"
                  _hover={{ bg: "gray.50", transform: "translateY(-2px)" }}
                  transition="all 0.3s"
                  fontWeight="medium"
                  letterSpacing={{ base: "normal", md: "wide" }}
                  boxShadow="none"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  登録
                </Button>
              </Flex>
            </VStack>
          </Box>
        </Container>
      </Center>
    </Box>
  )
}

export default App
