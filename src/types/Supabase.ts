export enum Score {
    bad,
    poor,
    normal,
    good,
    excellent
}

export enum Role {
    normal,
    manager,
    president,
    super
};



export type report_relation_entry = {
    report_id: string,
    report_kpi_id: string,
}

export type report_relation = {
    id: string,
    created_at: string,
    report_id: string,
    report_kpi_id: string,
}

export type University = {
    id: string,
    university_name: string,
    create_at: string,
}

export type Profile = {
    id: string,
    university_id: string,
    email: string,
    display_name: string,
    create_at: string,
    role: Role,
    updated_at: string,
}



export type Report = {
    id?: string,
    created_at?: string,
    updated_at?: string,
    content_id?: string,
    user_id?: string,
    report: string,
    conversation: string,
    university_id?: string,
}

export type ReportDataSet = {
    report: Report,
    report_case_name: string,
    report_content_title: string,
    report_doctor_explanation: string,
    report_user_name: string,
}

export type Lesson = {
    id: string,
    case_name: string,
    created_at?: string
}

export type Content = {
    id?: string,
    title: string,
    context: string,
    lesson_id: string,
    points: string[],
    created_at?: string,
    disease: string,
    doctor_explanation: string,
}
export type SharedAccess = {
    id?: string,
    created_at?: string,
    owner_user_id: string,
    give_user_id: string,
}

export type SharedSets = {
    shared_access: SharedAccess,
    user: Profile
}