import { FieldType } from './formBuilderTypes'; 

export interface FormTemplate {
    date_Created: string | number | Date;
    
    _id: string;
    user_id: string;
    name: string;
    dates: {
        created: string;  // ISO date string
        modified: string; 
        start?: string;
        end?: string;
    };
    version: number;
    fields: Array<FieldType>;
    status: string;
    usage_count: number;
    deleted: boolean;
}


