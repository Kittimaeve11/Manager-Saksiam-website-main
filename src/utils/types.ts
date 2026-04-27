
// -------------------------------------------------------------------
// <--  Model  -->

import type { Dispatch, SetStateAction } from "react";
import type { Dayjs } from "dayjs";
// -------------------------------------------------------------------
export interface Column {
  id: number;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface ComponentsTextModelProps {
  name: string;
  titlename: string;
  subject: string;
  setsubject: (value: string) => void;
  topon: number
  handleFieldChange: (fieldName: string, value: unknown) => void
  error: string | undefined
  fieldKey: string
  specify: boolean
}


type ConfirmType = 'add' | 'edit' | 'delete' | 'alternate' | 'status' | 'approve' | 'reset';

export interface ConfirmDialogProps {
  type: ConfirmType;
  confirmDialog: {
    isOpen: boolean;
    isSuccess?: boolean;
    isLoading: boolean;
    onConfirm: () => void;
  };
  setConfirmDialog: Dispatch<SetStateAction<{
    isOpen: boolean;
    isSuccess?: boolean;
    isLoading: boolean;
    onConfirm: () => void;
  }>>;
}

export interface NotificationProps {
  notify: {
    isOpen: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  };
  setNotify: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      message: string;
      type: "success" | "error" | "warning" | "info";
    }>
  >;
}


export interface BoxUploadProfileProps {
  profile: string | File | null;
  setProfile: React.Dispatch<React.SetStateAction<File | null>>
  handleFieldChange: (fieldName: string, value: unknown) => void
  error: string | undefined
  fieldKey: string
  loading: boolean | null
  topon: number
}
export interface BoxUploadBannerProps {
 filepicturePC: string | File | null;
  setFilepicturePC: React.Dispatch<React.SetStateAction<File | null>>
  filpictureMoblie: string | File | null;
  setFilepictureMoblie: React.Dispatch<React.SetStateAction<File | null>>
  handleFieldChange: (fieldName: string, value: unknown) => void
  error1: string | undefined
  error2: string | undefined
  fieldKey1: string
  fieldKey2: string
  loading: boolean | null
  topon: number
}


export interface BasicDatePickerProps {
  name: string;
  subject: Dayjs | null;
  setsubject: React.Dispatch<React.SetStateAction<Dayjs | null>>
  topon: number
  handleFieldChange: (fieldName: string, value: unknown) => void
  error: string | undefined
  fieldKey: string
  specify: boolean
}


export interface BasicDropDownSeleteProps {
  id: number;
  name: string;
  active?: string
}



export interface PayloadType {
    nameTH: string;
    nameEN: string;
    savename: string;
    active: string;
}

// -------------------------------------------------------------------
// form  -->
// -------------------------------------------------------------------

// role
export interface FormRoleData {
  roleName: string;
  permission_ids: number[];
}

// user
export interface FormUserData {
  pname: string;
  fname: string;
  lname: string;
  nickname: string;
  birthday: Dayjs | string | null;
  IDCard: string;
  address: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  email: string;
  password: string;
  phone: string;
  phone6: string;
  selectedRole: number | null;
  photo: File | null;
}

export interface FormEditUserData {
  pname: string;
  fname: string;
  lname: string;
  nickname: string;
  birthday: Dayjs | string | null;
  IDCard: string;
  address: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  email: string;
  phone: string;
  phone6: string;
  selectedRole: number | null;
  photo: File | null;
}

export interface FormProfileData {
  pname: string;
  fname: string;
  lname: string;
  nickname: string;
  birthday: Dayjs | string | null;
  IDCard: string;
  address: string;
  district: string;
  amphoe: string;
  province: string;
  zipcode: string;
  email: string;
  phone: string;
  phone6: string;
  photo: File | null;
}

export interface ForChangePassword {
  passwordOld: string
  passwordNew: string
  passwordConform: string
}

//banner
export interface FormBannerData {
  brandername: string;
  picturePC: string | File | null;
  pictureMoblie: string | File | null;
}


//topic
export interface FormTopicsData {
  topicnameTH: string
  topicnameEN: string
}

// -------------------------------------------------------------------
// <-- error  -->
// -------------------------------------------------------------------

// role
export interface FormRoleErrors {
  roleName?: string;
  permission_ids?: string;
  [key: string]: string | undefined;
}
// user
export interface FormUserDataErrors {
  pname?: string;
  fname?: string;
  lname?: string;
  nickname?: string;
  birthday?: string;
  IDCard?: string;
  address?: string;
  district?: string;
  amphoe?: string;
  province?: string;
  zipcode?: string;
  email?: string;
  password?: string;
  phone?: string;
  phone6?: string;
  selectedRole?: string;
  photo?: string;
  [key: string]: string | undefined;
}

export interface FormEditUserDataErrors {
  pname?: string;
  fname?: string;
  lname?: string;
  nickname?: string;
  birthday?: string;
  IDCard?: string;
  address?: string;
  district?: string;
  amphoe?: string;
  province?: string;
  zipcode?: string;
  email?: string;
  phone?: string;
  phone6?: string;
  selectedRole?: string;
  photo?: string;
  [key: string]: string | undefined;
}

export interface FormProfileDataErrors {
  pname?: string;
  fname?: string;
  lname?: string;
  nickname?: string;
  birthday?: string;
  IDCard?: string;
  address?: string;
  district?: string;
  amphoe?: string;
  province?: string;
  zipcode?: string;
  email?: string;
  phone?: string;
  phone6?: string;
  photo?: string;
  [key: string]: string | undefined;
}

export interface ForChangePasswordErrors {
  passwordOld?: string
  passwordNew?: string
  passwordConform?: string
  [key: string]: string | undefined;
}

// role
export interface FormTopicsDataErrors {
  topicnameTH?: string
  topicnameEN?: string
  [key: string]: string | undefined;
}


//banner
export interface FormBannerDataErrors {
  brandername?: string
  picturePC?: string
  pictureMoblie?: string
  [key: string]: string | undefined;
}











// -------------------------------------------------------------------
// <--  response  -->
// -------------------------------------------------------------------

// <--- RolePermission --->
interface RolePermisionDataProps {
  role_id: number;
  role_name: string;
  savename: string;
  createAt: string;
  updateAt: string;
}

export interface RolePermisionData {
  counts: number;
  roles: RolePermisionDataProps[]
}

export interface Roletypeseleteitem {
  id: number;
  name: string;
}

export interface ComponentRoletypeSeleteProps {
  selectedRoleType: number | null;
  setSelectedRoleType: React.Dispatch<React.SetStateAction<number | null>>;

}
// <--- Auther --->
export interface AutherDataProps {
  user_id: number;
  usernum: string;
  pname: string;
  fname: string;
  lname: string;
  nickname: string;
  email: string;
  phone6: string;
  status: string;
  savename: string;
  createAt: string;
  updateAt: string;
  role_id: number;
  role_name: string;
}
export interface AutherData {
  counts: number;
  users: AutherDataProps[]
}

export interface AutherItems {
  personnel_ID: number;
  personnel_num: string;
  personnel_pname: string
  personnel_fname: string
  personnel_lname: string
  nickname: string
  birthday: string
  IDCard: string
  address: string
  district: string
  amphoe: string
  province: string
  zipcod: string
  phone: string
  phone6: string
  status: string
  email: string
  regisname: string
  photo: string
  createby: string
  updateby: string
  createdate: string
  updatedate: string
  role_id: number
  role_name: string
}

// <--- Banner --->
interface BannerProps {
  id: number
  name: string
  picturePC: string
  pictureMoblie: string
  type: string
  link: string
  active: string
  savename: string
  createAt: string
  updateAt: string
}

export interface BannerData {
  bannerscount: number;
  bannder: BannerProps[]
}
// <--- Branch --->
interface BranchProps {
  id:string
  region:number
  area:string
  type:number
  name:string
  address:string
  districtid:string
  districtname:string
  amphurid:number
  amphurname:string
  provinceid:number
  zipcode:string
  detail:string
  tel:string
  lat:string
  lng:string
  status:string
  savename:string
  createAt:string
  updateAt:string
}
export interface BranchData {
  counts: number;
  data: BranchProps[]
}



// <--- Topics --->
interface TopicProps {
  topic_id: number
  nameTH: string
  nameEN: string
  savename: string
  active: string
  createAt: string
  updateAt: string
}

export interface TopicsData {
  counts: number
  topics: TopicProps[]
}