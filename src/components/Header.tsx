"use client";

import { Container,Center, Icon, Flex, Button, VStack, Text, Drawer, Heading, Link, DrawerHeader, DrawerFooter, DrawerBody, useDisclosure } from '@yamada-ui/react';
import { IoMdMenu } from "react-icons/io";

export const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Container p={0} m={0} borderBottom="1px solid" borderColor="gray.200">
                <Flex justifyContent="space-between" alignItems="center" pl={4} pt={2} pb={2} pr={4}>
                    <Center >
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500" textAlign="center">
                            Survey AI 
                        </Text>
                    </Center>
                </Flex>
            </Container>
        </>
    )
}