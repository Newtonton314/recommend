"use client";

import { Container, Center, Icon, Flex, Button, VStack, Text, Drawer, Heading, Link, DrawerHeader, DrawerFooter, DrawerBody, useDisclosure, HStack } from '@yamada-ui/react';
import { IoMdMenu } from "react-icons/io";
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export const Header = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const pathname = usePathname();

    return (
        <>
            <Container p={0} m={0} borderBottom="1px solid" borderColor="gray.200">
                <Flex justifyContent="space-between" alignItems="center" pl={4} pt={2} pb={2} pr={4}>
                    <Link 
                        as={NextLink}
                        href="/dashboard" 
                        _hover={{ textDecoration: 'none' }}
                    >
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500" textAlign="center">
                            Survey AI 
                        </Text>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                        <Link 
                            as={NextLink}
                            href="/dashboard"
                            color={pathname === '/dashboard' ? 'blue.500' : 'gray.700'}
                            fontWeight={pathname === '/dashboard' ? 'bold' : 'normal'}
                            _hover={{ color: 'blue.600' }}
                        >
                            調査検索
                        </Link>
                        <Link 
                            as={NextLink}
                            href="/dashboard/recommend"
                            color={pathname === '/dashboard/recommend' ? 'blue.500' : 'gray.700'}
                            fontWeight={pathname === '/dashboard/recommend' ? 'bold' : 'normal'}
                            _hover={{ color: 'blue.600' }}
                        >
                            候補者レコメンド
                        </Link>
                    </HStack>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        onClick={onOpen}
                        display={{ base: 'flex', md: 'none' }}
                        p={2}
                    >
                        <Icon as={IoMdMenu} fontSize="2xl" />
                    </Button>
                </Flex>
            </Container>

            {/* Mobile Navigation Drawer */}
            <Drawer isOpen={isOpen} onClose={onClose} placement="right">
                <DrawerHeader borderBottomWidth="1px">
                    <Text fontSize="lg" fontWeight="bold">メニュー</Text>
                </DrawerHeader>
                <DrawerBody>
                    <VStack spacing={4} align="stretch">
                        <Link 
                            as={NextLink}
                            href="/dashboard"
                            onClick={onClose}
                            color={pathname === '/dashboard' ? 'blue.500' : 'gray.700'}
                            fontWeight={pathname === '/dashboard' ? 'bold' : 'normal'}
                            fontSize="lg"
                            _hover={{ color: 'blue.600' }}
                        >
                            調査検索
                        </Link>
                        <Link 
                            as={NextLink}
                            href="/dashboard/recommend"
                            onClick={onClose}
                            color={pathname === '/dashboard/recommend' ? 'blue.500' : 'gray.700'}
                            fontWeight={pathname === '/dashboard/recommend' ? 'bold' : 'normal'}
                            fontSize="lg"
                            _hover={{ color: 'blue.600' }}
                        >
                            候補者レコメンド
                        </Link>
                    </VStack>
                </DrawerBody>
            </Drawer>
        </>
    )
}