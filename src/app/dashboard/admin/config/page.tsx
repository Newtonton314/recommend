"use client";
import { useEffect, useState } from "react";
import {
    Text, Flex, Input, Textarea, Badge,
    Center, Container, Box, Button, Heading, Card, HStack, VStack,
    Alert, AlertIcon, AlertTitle, AlertDescription, Icon,
    Tabs, TabList, Tab, TabPanels, TabPanel, Grid, GridItem, Tag,
    Divider, IconButton, Tooltip
} from '@yamada-ui/react';
import useAuth from "@/functions/useAuth";
import { FaPlus, FaMinus, FaUserPlus, FaCheck, FaCopy, FaLink, FaHospital, FaStar, FaLightbulb, FaTimes } from "react-icons/fa";
import { LuSave } from "react-icons/lu";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChangeUniversity, GetUniversity } from "@/functions/supabaseClient";
import { Role } from "@/types/Supabase";
import { useRouter } from "next/navigation";

const ConfigPage = () => {
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [current, setCurrent] = useState<string>("");
    const [value, setValue] = useState<string[]>([]);
    const [inviteEmail, setInviteEmail] = useState<string>("");
    const [inviteMethod, setInviteMethod] = useState<string>("magic-link");
    const [inviteResult, setInviteResult] = useState<string>("");
    const [inviteLink, setInviteLink] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const { user, session, profile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (profile?.role == Role.normal) {
            router.push("/dashboard/user");
        }
        
        // プロファイルが取得できたらテナント情報を取得
        if (profile?.university_id) {
            fetchUniversityData(profile.university_id);
        }
    }, [profile]);

    // テナント情報を取得する関数
    const fetchUniversityData = async (universityId: string) => {
        try {
            const universityData = await GetUniversity(universityId);
            if (universityData) {
                // 取得したテナント情報をフォームにセット
                setName(universityData.university_name || "");
            }
        } catch (error: any) {
            console.error("大学情報取得エラー:", error);
            setError("大学情報の取得に失敗しました: " + (error.message || "不明なエラー"));
        }
    };

    type Company = {
        name: string | null,
        value: string[] | null,
    }


    const submit = () => {
        if (!profile) {
            setError("ログインし直してください。");
            return;
        }

        const id = profile.university_id;
        const send_name = name == "" ? null : name;
        const send_value = value.length == 0 ? null : value;

        ChangeUniversity(id, send_name, send_value).then((data) => {
            console.log(data);
            if (data.success) {
                setMessage("更新に成功しました。");
                // 更新後に再度データを取得して表示を更新
                fetchUniversityData(id);
            } else {
                setError("更新に失敗しました。");
            }
        }).catch((error) => {
            console.log(error);
            setError("更新に失敗しました。 " + error.message);
        })
    }

    // 招待処理を実行する関数
    const handleInvite = async () => {
        if (!inviteEmail) {
            setError("メールアドレスを入力してください。");
            return;
        }
        
        if (!profile?.university_id) {
            setError("大学IDが取得できません。");
            return;
        }

        setIsLoading(true);
        setError("");
        setInviteResult("");
        setInviteLink("");

        try {
            // ここでローカルの /api/inviteUser にPOSTリクエスト
            const res = await fetch('/api/inviteUser', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: inviteEmail,        // ユーザーが入力したメールアドレス
                university_id: profile.university_id, // プロファイルにある大学ID
              }),
            })
        
            const json = await res.json()
            if (!res.ok || !json.success) {
              // 失敗時
              setError(json.error || '招待に失敗しました')
            } else {
              // 成功時
              setInviteResult('招待メールを送信しました')
            }
        
        } catch (err: any) {
            setError('サーバーエラー: ' + err.message)
        } finally {
            setIsLoading(false)
        }
    };

    // リンクをクリップボードにコピーする関数
    const copyLinkToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink)
                .then(() => {
                    setInviteResult("招待リンクをコピーしました！");
                })
                .catch(() => {
                    setError("リンクのコピーに失敗しました。");
                });
        }
    };

    // 招待UIを表示/非表示する関数
    const toggleDialog = () => {
        setDialogOpen(!dialogOpen);
        if (!dialogOpen) {
            // ダイアログを開くときにリセット
            setInviteEmail("");
            setInviteMethod("magic-link");
            setInviteResult("");
            setInviteLink("");
            setError("");
        }
    };

    return (
        <Container>
            <Flex w="100%" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Link
                        href="/dashboard/admin/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        <span className="text-lg">管理者画面に戻る</span>
                    </Link>
                </Box>
                <Button 
                    rightIcon={<FaUserPlus />} 
                    colorScheme="blue" 
                    onClick={toggleDialog}
                >
                    共有（メンバーをメールアドレスで招待）
                </Button>
            </Flex>
            <Card mb={8} p={6} boxShadow="md" borderRadius="xl" w={{ base: "60%", md: "100%" }} mx="auto">
                <Center mb={6}>
                    <Flex alignItems="center">
                        <Icon as={FaHospital} boxSize={8} color="blue.500" mr={3} />
                        <Heading as="h1" size="xl">管理者 設定</Heading>
                    </Flex>
                </Center>
                <Text textAlign="center" color="gray.600" mb={6}>
                    管理者用の設定ページです
                </Text>
                <Divider mb={6} />
            </Card>

            {/* 招待ダイアログ */}
            {dialogOpen && (
                <Box
                    position="fixed"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(0,0,0,0.4)"
                    backdropFilter="blur(4px)"
                    zIndex="10"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Card
                        p={5}
                        borderRadius="md"
                        width="500px"
                        maxW="90%"
                        boxShadow="2xl"
                        bg="white"
                    >
                        <Flex justifyContent="space-between" alignItems="center" mb={4}>
                            <Heading size="md">メンバーを招待</Heading>
                            <Button variant="ghost" onClick={toggleDialog}>×</Button>
                        </Flex>
                        
                        <Box mb={4}>
                            <Text mb={2}>招待方法</Text>
                            <Tabs index={inviteMethod === "magic-link" ? 0 : 1} onChange={(index) => setInviteMethod(index === 0 ? "magic-link" : "invite-link")}>
                                <TabList mb={4}>
                                    <Tab><Flex gap={2} alignItems="center"><Text>招待メールを送信</Text><Icon as={FaCopy} /></Flex></Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        <Text mb={2}>招待したいユーザーのメールアドレスを入力してください</Text>
                                        <Input 
                                            type="email" 
                                            placeholder="招待するメールアドレス" 
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                            
                            {inviteResult && (
                                <Alert status="success" mb={4}>
                                    <AlertIcon />
                                    <AlertDescription>{inviteResult}</AlertDescription>
                                </Alert>
                            )}
                            
                            {inviteLink && (
                                <Box mt={2} mb={4}>
                                    <Text mb={2}>
                                        <Icon as={FaLink} mr={1} />
                                        招待リンク:
                                    </Text>
                                    <Flex gap={2}>
                                        <Input 
                                            value={inviteLink} 
                                            readOnly 
                                            bg="gray.50" 
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <Button onClick={copyLinkToClipboard}>
                                            <Icon as={FaCopy} />
                                        </Button>
                                    </Flex>
                                </Box>
                            )}
                            
                            {error && (
                                <Alert status="error" mb={4}>
                                    <AlertIcon />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </Box>
                        
                        <Flex justifyContent="flex-end" gap={2}>
                            <Button variant="outline" onClick={toggleDialog}>
                                キャンセル
                            </Button>
                            <Button 
                                colorScheme="blue" 
                                onClick={handleInvite}
                                isDisabled={!inviteEmail || isLoading}
                                isLoading={isLoading}
                                leftIcon={inviteMethod === "magic-link" ? <FaLink /> : <FaCopy />}
                            >
                                {inviteMethod === "magic-link" ? "招待メールを送信" : "招待メールを生成"}
                            </Button>
                        </Flex>
                    </Card>
                </Box>
            )}
            {
                error !== "" &&
                <Center pt={"lg"}>
                    <Box>
                        <Alert status="error" variant="subtle" w="100%">
                            <AlertIcon />
                            <AlertTitle>エラー：</AlertTitle>
                            <AlertDescription>
                                {error}
                            </AlertDescription>
                        </Alert>
                    </Box>
                </Center>
            }
            {
                message !== "" &&
                <Center pt={"lg"}>
                    <Box>
                        <Alert status="success" variant="subtle" w="100%">
                            <AlertIcon />
                            <AlertTitle>成功：</AlertTitle>
                            <AlertDescription>
                                {message}
                            </AlertDescription>
                        </Alert>
                    </Box>
                </Center>
            }

        </Container>
    )
}

export default ConfigPage;
