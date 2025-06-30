// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';
import { Profile, SharedSets, Content, Lesson, Report, ReportDataSet, SharedAccess, University, report_relation, report_relation_entry } from '../types/Supabase';
import { start } from 'repl';
import useAuth from "@/functions/useAuth";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const Login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        console.error('ログイン失敗:', error.message);
        // エラーが発生した場合は、成功フラグとエラー情報を含むオブジェクトを返す
        return { success: false, error };
    } else {
        console.log('ログイン成功:', data);
        // 成功時は、ユーザー情報などを返す
        return { success: true, data };
    }
};

export const Logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("ログアウトエラー:", error.message);
        return { success: false, error };
    } else {
        console.log("ログアウト成功");
        return { success: true };
    }
};

export const SignUp = async (
    university: string,
    email: string,
    password: string,
    name: string
) => {
    // ユーザーの登録（Supabase v2の場合、signUpの戻り値はdata.userとなります）
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('登録失敗:', authError.message);
        return { success: false, authError };
    }
    if (!authData?.user) {
        console.error('ユーザー情報が取得できません');
        return { success: false, authData };
    }

    const user: User = authData.user;
    console.log('登録成功:', user);

    const { data: existingData, error: existingError } = await supabase
        .from("university")
        .select("*")
        .eq("university_name", university);

    if (existingError) {
        console.error('エラー:', existingError.message);
        return { success: false, authData };
    }
    let insertedUUID: string = "";

    if (existingData && existingData.length > 0) {
        console.log('同じ名前を持つ行が既に存在します');
        insertedUUID = existingData[0]["id"];
        console.log("Inserted UUID:", insertedUUID);
    } else {
        const { data: lessonData, error: lessonError } = await supabase
            .from("university")
            .insert([
                { university_name: university }
            ]);

        if (lessonError) {
            console.log("大学名登録失敗", lessonError.message);
            return { success: false, authData };
        }
        if (lessonData) {
            insertedUUID = lessonData[0]["id"]; // ここでUUIDの値を取得
            console.log("Inserted UUID:", insertedUUID);
        }
        console.log("大学名を登録しました。");
    }

    // プロフィール情報の挿入
    console.log("ユーザー情報:", user);
    console.log("大学UUID:", insertedUUID);

    const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .insert([
            { email: email, display_name: name, university_id: insertedUUID, id: user.id, role: "normal" }
        ]);
    if (profileError) {
        console.error('プロフィール登録失敗:', profileError.message);
        return { success: false, data: profileError };
    }

    console.log('プロフィール登録成功:', profileData);
    return { success: true, data: profileData };
};

export const GetUserInfo = async (user_id: string) => {
    const { data: existingData, error: existingError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user_id)
        .single();
    if (existingError) {
        console.error('エラー:', existingError.message);
        return { success: false, error: existingError };
    }
    if (existingData) {
        const formattedData: Profile = existingData;
        return { success: true, data: formattedData };
    }
    return { success: false, message: "データが見つかりません" };
}

export const ChangeUniversity = async (id: string, name: string | null, value: string[] | null) => {

    const updateContent =
        name != null && value != null ? { name: name, value: value } :
            name != null && value == null ? { name: name } :
                name == null && value != null ? { value: value } :
                    null;

    if (!updateContent) {
        return { success: false };
    }

    const { error: existingError } = await supabase
        .from("university")
        .update(updateContent)
        .eq('id', id);
    if (existingError) {
        console.log("更新失敗:", existingError.message);
        return { success: false, existingError };
    } else {
        console.log("更新成功");
        return { success: true, message: "更新成功" };
    }
}

export const GetUniversity = async (id: string) => {
    const { data: existingData, error: existingError } = await supabase
        .from("university")
        .select("*")
        .eq("id", id);

    if (existingError) {
        console.error('エラー:', existingError.message);
        return null;
    }

    if (existingData) {
        const formattedData: University[] = existingData;
        console.log(formattedData);
        console.log(formattedData[0]);
        return formattedData[0];
    }
    return null;
}

export const SaveReport = async (report: Report) => {
    console.log("supabaseへ登録:", report);
    console.log("内容:", report.conversation);
    const { error: Error } = await supabase
        .from('report')
        .insert([
            {
                user_id: report.user_id,
                content_id: report.content_id,
                conversation: report.conversation,
                report: report.report,
                uiversity_id: report.university_id,
            }
        ]);

    if (Error) {
        console.error('日報登録失敗:', Error.message);
        return false;
    }

    console.log('日報登録成功');
    return true;
}




export const AddReportRelation = async (relation: report_relation_entry) => {
    const { data: InsertData, error: InsertError } = await supabase
        .from('report_relation')
        .insert([
            {
                report_id: relation.report_id,
                report_kpi_id: relation.report_kpi_id,
            }
        ]);

    if (InsertError) {
        console.error('リレーション登録失敗:', InsertError.message);
        return { success: false, InsertError };
    } else {

        console.log('リレーション登録成功');
        return { success: true, InsertData };
    }
}

export const GetReportRelations = async (report_id: string) => {
    const { data: GetData, error: GetError } = await supabase
        .from("report_relation")
        .select("*")
        .eq("report_id", report_id);

    if (GetError) {
        console.error('エラー:', GetError.message);
        return { sucsess: false, GetError };
    }
    if (GetData) {
        console.log("リレーション取得成功:", GetData);
        return { success: true, GetData }
    }
    return null;
}




export const GetReport = async (id: string) => {
    const { data: existingData, error: existingError } = await supabase
        .from("report")
        .select("*")
        .eq("id", id)
        .single();

    if (existingError) {
        console.error('レポート取得エラー:', existingError.message);
        return { success: false, error: existingError };
    }
    if (existingData) {
        return { success: true, data: existingData };
    }
    return null;
}
// 変更: GetReports にページ番号と1ページあたりの件数をパラメータとして追加、ソートと日付範囲検索も可能に
export const GetReports = async (university_id: string, page: number = 1, pageSize: number = 10, sortDirection: 'asc' | 'desc' = 'desc', startDate?: string, endDate?: string): Promise<Report[] | []> => {
    // 変更: ページネーション用の範囲を計算
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("report")
        .select("*")
        .eq("university_id", university_id)

    if (startDate) {
        query = query.gte("created_at", startDate);
    }
    if (endDate) {
        query = query.lte("created_at", endDate);
    }
    
    // 日付順でのソート（昇順または降順）
    query = query.order('created_at', { ascending: sortDirection === 'asc' });
    
    query = query.range(from, to);

    const { data: existingData, error: existingError } = await query

    if (existingError) {
        console.error('エラー:', existingError.message);
        return [];
    }

    if (existingData) {
        const formattedData: Report[] = existingData;
        console.log(formattedData);
        return formattedData;
    }
    return [];
}

// GetReportDataSets関数 - データベースから条件に合うレポートのみを取得
export const GetReportDataSets = async (university_id: string, page: number = 1, pageSize: number = 10, sortDirection: 'asc' | 'desc' = 'desc', startDate?: string, endDate?: string) => {
        try {
            // レポートの取得
            const reports = await GetReports(university_id, page, pageSize, sortDirection, startDate, endDate);
            if (!reports || reports.length === 0) {
                return { success: false, message: "レポートが見つかりません" };
            }

            // 2. 各レポートに関連するlesson, content情報をまとめて取得
            const reportDataSets = await Promise.all(
                reports.map(async (report) => {
                    // レポートにIDがなければ無効
                    if (!report.id) {
                    return null;
                    }
    
                    // レポートの content_id から content 情報を取得
                    // (report.content_id が存在する前提)
                    let contentData: Content | null = null;
                    if (report.content_id) {
                    const { data: contentRows, error: contentError } = await supabase
                        .from("content")
                        .select("*")
                        .eq("id", report.content_id)
                        .single();
    
                    if (!contentError && contentRows) {
                        contentData = contentRows;
                    }
                    }

                    let profileData: Profile | null = null;
                    if (report.user_id) {
                    const { data: profileRows, error: profileError } = await supabase
                        .from("profile")
                        .select("*")
                        .eq("id", report.user_id)
                        .single();
    
                    if (!profileError && profileRows) {
                        profileData = profileRows;
                    }
                    }
    
                    // content から lesson_id を取得し、lesson情報を取得
                    // (content?.lesson_id が存在する前提)
                    let lessonData: Lesson | null = null;
                    if (contentData?.lesson_id) {
                    const { data: lessonRows, error: lessonError } = await supabase
                        .from("lesson")
                        .select("*")
                        .eq("id", contentData.lesson_id)
                        .single();
    
                    if (!lessonError && lessonRows) {
                        lessonData = lessonRows;
                    }
                    }
    
                    return {
                    report,
                    // lesson テーブルの case_name
                    report_case_name: lessonData?.case_name || "",
                    // content テーブルの title
                    report_content_title: contentData?.title || "",
                    // content テーブルの doctor_explanation
                    report_doctor_explanation: contentData?.doctor_explanation || "",
                    report_user_name: profileData?.display_name || "",
                    };
                })
                );
                

            //nullでないデータセットのみを返す
            const validDataSets = reportDataSets.filter((dataset): dataset is ReportDataSet => dataset !== null);

            return {
                success: true,
                data: validDataSets
            };
        } catch (error) {
            console.error('GetReportDataSetエラー:', error);
            return {
                success: false,
                message: "データの取得中にエラーが発生しました",
                error
            };
        }
}

export const GetReportsByID = async (user_id: string, page: number = 1, pageSize: number = 10, startDate?: string, endDate?: string): Promise<Report[] | []> => {
    // 変更: ページネーション用の範囲を計算
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("report")
        .select("*")
        .eq("user_id", user_id)

    if (startDate) {
        query = query.gte("created_at", startDate);
    }
    if (endDate) {
        query = query.lte("created_at", endDate);
    }
    query = query.range(from, to);

    const { data: existingData, error: existingError } = await query;


    if (existingError) {
        console.error('エラー:', existingError.message);
        return [];
    }

    if (existingData) {
        const formattedData: Report[] = existingData;
        console.log(formattedData);
        return formattedData;
    }
    return [];
}



export const GetMyReportDataSetsByID = async (
    user_id: string,
    page: number = 1,
    pageSize: number = 10,
    startDate?: string,
    endDate?: string
    ) => {
        try {
            // 1. レポートの取得
            const reports = await GetReportsByID(user_id, page, pageSize, startDate, endDate);
            if (!reports || reports.length === 0) {
            return { success: false, message: "レポートが見つかりません" };
            }

            // 2. 各レポートに関連するlesson, content情報をまとめて取得
            const reportDataSets = await Promise.all(
            reports.map(async (report) => {
                // レポートにIDがなければ無効
                if (!report.id) {
                return null;
                }

                // レポートの content_id から content 情報を取得
                // (report.content_id が存在する前提)
                let contentData: Content | null = null;
                if (report.content_id) {
                const { data: contentRows, error: contentError } = await supabase
                    .from("content")
                    .select("*")
                    .eq("id", report.content_id)
                    .single();

                if (!contentError && contentRows) {
                    contentData = contentRows;
                }
                }

                // content から lesson_id を取得し、lesson情報を取得
                // (content?.lesson_id が存在する前提)
                let lessonData: Lesson | null = null;
                if (contentData?.lesson_id) {
                const { data: lessonRows, error: lessonError } = await supabase
                    .from("lesson")
                    .select("*")
                    .eq("id", contentData.lesson_id)
                    .single();

                if (!lessonError && lessonRows) {
                    lessonData = lessonRows;
                }
                }

                return {
                report,
                // lesson テーブルの case_name
                report_case_name: lessonData?.case_name || "",
                // content テーブルの title
                report_content_title: contentData?.title || "",
                // content テーブルの doctor_explanation
                report_doctor_explanation: contentData?.doctor_explanation || "",
                };
            })
            );

            // 3. null でないデータセットのみを返す
            const validDataSets = reportDataSets.filter(
            (dataset): dataset is ReportDataSet => dataset !== null
            );

            return {
            success: true,
            data: validDataSets,
            };
        } catch (error) {
            console.error("GetReportDataSetエラー:", error);
            return {
            success: false,
            message: "データの取得中にエラーが発生しました",
            error,
            };
        }
};

export const GetReportDetailsByID = async (reportId: string) => {
  try {
    // 1. report テーブルから reportId に一致するレポートを取得
    const { data: reportData, error: reportError } = await supabase
      .from("report")
      .select("*")
      .eq("id", reportId)
      .single();
    if (reportError || !reportData) {
      return { success: false, message: "Report not found", error: reportError };
    }

    // 2. report の content_id を使って content テーブルから内容を取得
    let contentData: Content | null = null;
    if (reportData.content_id) {
      const { data: contentRows, error: contentError } = await supabase
        .from("content")
        .select("*")
        .eq("id", reportData.content_id)
        .single();
      if (contentError || !contentRows) {
        return { success: false, message: "Content not found", error: contentError };
      }
      contentData = contentRows;
    }

    // 3. content の lesson_id を使って lesson テーブルから詳細（case_name）を取得
    let lessonData: Lesson | null = null;
    if (contentData?.lesson_id) {
      const { data: lessonRows, error: lessonError } = await supabase
        .from("lesson")
        .select("*")
        .eq("id", contentData.lesson_id)
        .single();
      if (lessonError || !lessonRows) {
        return { success: false, message: "Lesson not found", error: lessonError };
      }
      lessonData = lessonRows;
    }

    // 4. 取得した各データをまとめて返却
    return {
      success: true,
      data: {
        report: reportData,
        report_content_title: contentData?.title || "",
        report_doctor_explanation: contentData?.doctor_explanation || "",
        report_case_name: lessonData?.case_name || "",
      },
    };
  } catch (error) {
    console.error("GetReportDetailsByID error:", error);
    return {
      success: false,
      message: "Error retrieving report details",
      error,
    };
  }
};

export const GetReportDetailsByIDForAdmin = async (reportId: string) => {
    try {
      // 1. report テーブルから reportId に一致するレポートを取得
      const { data: reportData, error: reportError } = await supabase
        .from("report")
        .select("*")
        .eq("id", reportId)
        .single();
      if (reportError || !reportData) {
        return { success: false, message: "Report not found", error: reportError };
      }
  
      // 2. report の content_id を使って content テーブルから内容を取得
      let contentData: Content | null = null;
      if (reportData.content_id) {
        const { data: contentRows, error: contentError } = await supabase
          .from("content")
          .select("*")
          .eq("id", reportData.content_id)
          .single();
        if (contentError || !contentRows) {
          return { success: false, message: "Content not found", error: contentError };
        }
        contentData = contentRows;
      }
  
      // 3. content の lesson_id を使って lesson テーブルから詳細（case_name）を取得
      let lessonData: Lesson | null = null;
      if (contentData?.lesson_id) {
        const { data: lessonRows, error: lessonError } = await supabase
          .from("lesson")
          .select("*")
          .eq("id", contentData.lesson_id)
          .single();
        if (lessonError || !lessonRows) {
          return { success: false, message: "Lesson not found", error: lessonError };
        }
        lessonData = lessonRows;
      }

      let profileData: Profile | null = null;
      if (reportData.user_id) {
      const { data: profileRows, error: profileError } = await supabase
          .from("profile")
          .select("*")
          .eq("id", reportData.user_id)
          .single();

      if (!profileError && profileRows) {
          profileData = profileRows;
        }
      }
  
      // 4. 取得した各データをまとめて返却
      return {
        success: true,
        data: {
          report: reportData,
          report_content_title: contentData?.title || "",
          report_doctor_explanation: contentData?.doctor_explanation || "",
          report_case_name: lessonData?.case_name || "",
          report_user_name: profileData?.display_name || "",
        },
      };
    } catch (error) {
      console.error("GetReportDetailsByID error:", error);
      return {
        success: false,
        message: "Error retrieving report details",
        error,
      };
    }
};

export const AddSharedAccess = async (share: SharedAccess) => {

    const { data: InsertData, error: InsertError } = await supabase
        .from('shared_access')
        .insert(share)
        .select()
        .single();

    if (InsertError) {
        console.error('共有関係登録失敗:', InsertError.message);
        return { success: false, InsertError };
    } else {
        console.log('共有関係登録成功');
        return { success: true, InsertData };
    }
}

export const DeleteSharedAccess = async (give_user_id: string) => {

    const { data: InsertData, error: InsertError } = await supabase
        .from('shared_access')
        .delete()
        .eq('give_user_id', give_user_id);

    if (InsertError) {
        console.error('共有関係削除失敗:', InsertError.message);
        return { success: false, InsertError };
    } else {
        console.log('共有関係削除成功');
        return { success: true, InsertData };
    }
}

export const GetAllSharedAccess = async (give_user_id: string) => {
    const { data: existingData, error: existingError } = await supabase
        .from("shared_access")
        .select("*")
        .eq("give_user_id", give_user_id);

    if (existingError) {
        console.error('共有関係取得エラー:', existingError.message);
        return { success: false, error: existingError };
    }

    if (existingData && existingData.length > 0) {
        const formattedData: SharedAccess[] = existingData;
        return { success: true, data: formattedData };
    }
    return { success: false, message: "データが見つかりません" };
}

export const GetAllSharedSets = async (user_id: string) => {
    const shared_access = await GetAllSharedAccess(user_id);
    if (!shared_access.success || !shared_access.data) {
        return { success: false, message: "共有データが見つかりません" };
    }
    
    try {
        // Promise.allを使用して、すべてのGetUserName呼び出しが完了するのを待つ
        const promises = shared_access.data.map(async (share) => {
            try {
                const user = await GetUserInfo(share.owner_user_id);
                if (user.success && user.data) {
                    return { shared_access: share, user: user.data };
                }
                return null;
            } catch (error) {
                console.error("GetUserInfoエラー:", error);
                return null;
            }
        });
        
        // すべてのプロミスが解決されるのを待つ
        const results = await Promise.all(promises);
        
        // nullでない結果だけをフィルタリング
        const shared_sets: SharedSets[] = results.filter(item => item !== null) as SharedSets[];
        
        if (shared_sets.length === 0) {
            return { success: false, message: "ユーザー情報が取得できませんでした" };
        }
        
        return { success: true, data: shared_sets };
    } catch (error) {
        console.error("GetAllSharedSetsエラー:", error);
        return { success: false, error: error instanceof Error ? error : new Error("不明なエラー") };
    }
}

export const GetAllArrowSharedAccess = async (owner_user_id: string) => {
    const { data: existingData, error: existingError } = await supabase
        .from("shared_access")
        .select("*")
        .eq("owner_user_id", owner_user_id);

    if (existingError) {
        console.error('共有関係取得エラー:', existingError.message);
        return { success: false, error: existingError };
    }

    if (existingData) {
        const formattedData: SharedAccess[] = existingData;
        return { success: true, data: formattedData };
    }
    return { success: false, message: "データが見つかりません" };
}
export const GetAllArrowSharedSets = async (user_id: string) => {
    const shared_access = await GetAllArrowSharedAccess(user_id);
    if (shared_access.success && shared_access.data) {
        let shared_sets: SharedSets[] = [];
        
        // Use Promise.all to properly handle the async operations in map
        await Promise.all(shared_access.data.map(async (share) => {
            const user = await GetUserInfo(share.give_user_id);
            if (user.success && user.data) {
                const data: SharedSets = { shared_access: share, user: user.data };
                shared_sets.push(data);
            }
        }));
        console.log("共有したユーザー:", shared_sets);
        return { success: true, data: shared_sets };
    } else {
        return { success: false, message: "データが見つかりません" };  // Fixed typo in Japanese message
    }
}
export const GetAllUserName = async (university_id: string) => {
    const { data: existingData, error: existingError } = await supabase
        .from("profile")
        .select("*")
        .eq("university_id", university_id);
    if (existingError) {
        console.error('エラー:', existingError.message);
        return { success: false, error: existingError };
    }
    if (existingData) {
        const formattedData: Profile[] = existingData;
        console.log(formattedData);
        return { success: true, data: formattedData };
    }
    return { success: false, message: "データが見つかりません" };
}

export const GetSearchUserName = async (university_id: string, search: string) => {

    const { data: existingData, error: existingError } = await supabase
        .from("profile")
        .select("*")
        .eq("university_id", university_id)
        .ilike("display_name", `%${search}%`);
    if (existingError) {
        console.error('エラー:', existingError.message);
        return { success: false, error: existingError };
    }
    if (existingData) {
        const formattedData: Profile[] = existingData;
        console.log(formattedData);
        return { success: true, data: formattedData };
    }
    return { success: false, message: "データが見つかりません" };
}

export const GetSearchUserNameFiltered = async (university_id: string, current_user_id: string, search: string) => {

    const shared_arrow_sets = await GetAllArrowSharedSets(current_user_id);
    const search_user = await GetSearchUserName(university_id, search);

    if (search_user.success && search_user.data) {
        //自分を除外
        const search_user_remove = search_user.data.filter((user) => user.id !== current_user_id);
        
        if (!shared_arrow_sets.data || shared_arrow_sets.data.length === 0 || shared_arrow_sets.success === false) {
            console.log("共有したユーザーがいません");
            console.log("フィルタリングされたユーザー:", search_user_remove);
            return { success: true, data: search_user_remove };
        } else {
            //共有したを持っているユーザーを除外
            const filtered_user = search_user_remove.filter((user) => {
                return shared_arrow_sets.data.some((shared) => shared.shared_access.give_user_id !== user.id);
            });

            if (filtered_user.length === 0) {
                console.log("フィルタリングされたユーザーが見つかりません");
                return { success: false, message: "フィルタリングされたユーザーが見つかりません" };
            }

            console.log("フィルタリングされたユーザー:", filtered_user);
            return { success: true, data: filtered_user };
        }

    }
    return { success: false, message: "データが見つかりません" };
}

export const AddLesson = async (name: string): Promise<boolean | []> => {

    console.log("AddLesson");
    const { data: existingData, error: existingError } = await supabase
        .from("lesson")
        .select("*")
        .eq("name", name);

    if (existingError) {
        console.error('エラー:', existingError.message);
        return false;
    }

    let insertedUUID: string = "";

    if (existingData && existingData.length > 0) {
        console.log('同じ名前を持つ行が既に存在します');
        insertedUUID = existingData[0]["id"];
        console.log("Inserted UUID:", insertedUUID);
    } else {
        const { data: lessonData, error: lessonError } = await supabase
            .from("lesson")
            .insert([
                { name: name }
            ]);
        console.log("lessonData", lessonData);
        console.log("lessonError", lessonError);

        if (lessonError) {
            console.log("登録失敗", lessonError.message);
            return false;
        }
        if (lessonData) {
            insertedUUID = lessonData[0]["id"]; // ここでUUIDの値を取得
            console.log("Inserted UUID:", insertedUUID);
        }
        console.log("登録しました。");
        return true;
    }
    return false;
}

export const AddContent = async (content: Content): Promise<boolean | []> => {

    const { data: existingData, error: existingError } = await supabase
        .from("content")
        .select("*")
        .eq("title", content.title);

    if (existingError) {
        console.error('エラー:', existingError.message);
        return false;
    }

    let insertedUUID: string = "";

    if (existingData && existingData.length > 0) {
        console.log('同じ名前を持つ行が既に存在します');
        insertedUUID = existingData[0]["id"];
        console.log("Inserted UUID:", insertedUUID);
        return false;
    } else {
        const { error: lessonError } = await supabase
            .from("content")
            .insert([
                { title: content.title, context: content.context, lesson_id: content.lesson_id, points: content.points }
            ]);
        if (lessonError) {
            console.log("登録失敗", lessonError.message);
            return false;
        } else {
            return true;
        }
    }
}

export const GetLessons = async (): Promise<Lesson[] | []> => {

    const { data: existingData, error: existingError } = await supabase
        .from("lesson")
        .select("*");

    if (existingError) {
        console.error('エラー:', existingError.message);
        return [];
    }

    if (existingData) {
        const formattedData: Lesson[] = existingData;
        console.log(formattedData);
        return formattedData;
    }
    return [];
}



export const Getlessons = async (lesson_id: string): Promise<Content[] | []> => {

    const { data: existingData, error: existingError } = await supabase
        .from("content")
        .select("*")
        .eq("lesson_id", lesson_id);

    if (existingError) {
        console.error('エラー:', existingError.message);
        return [];
    }

    if (existingData) {
        const formattedData: Content[] = existingData;
        console.log(formattedData);
        return formattedData;
    }
    return [];
}

export const GetContent = async (id: string): Promise<Content | null> => {
    console.log("GetContent");
    console.log("id:", id);
    const { data: existingData, error: existingError } = await supabase
        .from("content")
        .select("*")
        .eq("id", id);
    if (existingError) {
        console.error('エラー:', existingError.message);
        return null;
    }

    if (existingData) {
        const formattedData: Content[] = existingData;
        console.log(formattedData);
        console.log(formattedData[0]);
        return formattedData[0];
    }
    return null;
}


