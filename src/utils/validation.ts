import type { ForChangePassword, ForChangePasswordErrors, FormBannerData, FormBannerDataErrors, FormEditUserData, FormEditUserDataErrors, FormProfileData, FormProfileDataErrors, FormRoleData, FormRoleErrors, FormTopicsData, FormTopicsDataErrors, FormUserData, FormUserDataErrors } from "./types";


//role
export const validataRoleForm = (formData: FormRoleData): FormRoleErrors => {
  const errors: FormRoleErrors = {};

  if (!formData.roleName.trim()) {
    errors.roleName = "กรุณากรอกชื่อบทบาท";
  }

  if (!formData.permission_ids || formData.permission_ids.length === 0) {
    errors.permission_ids = "กรุณาเลือกสิทธิอย่างน้อย 1 รายการ";
  }

  return errors;
};


//personol

export const validateUserForm = (formData: FormUserData): FormUserDataErrors => {
  const errors: FormUserDataErrors = {};
  Object.keys(formData).forEach((field) => {
    switch (field) {
      case 'pname':
        if (!formData.pname) {
          errors.pname = 'กรุณากรอกคำนำหน้าชื่อ ';
        }
        break;
      case 'fname':
        if (!formData.fname) {
          errors.fname = 'กรุณากรอกชื่อจริง';
        }
        break;

      case 'lname':
        if (!formData.lname) {
          errors.lname = 'กรุณากรอกนามสกุล';
        }
        break;
      case 'nickname':
        if (!formData.nickname) {
          errors.nickname = 'กรุณากรอกชื่อเล่น';
        }
        break;

      case 'email':
        if (!formData.email) {
          errors.email = 'กรุณากรอกอีเมล';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        break;

      case 'password':
        if (!formData.password) {
          errors.password = 'กรุณากรอกรหัสผ่าน';
        } else if (formData.password.length < 6) {
          errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        }
        break;

      case 'phone':
        if (!formData.phone) {
          errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^0[0-9]{9}$/.test(formData.phone)) {
          errors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก และขึ้นต้นด้วย 0';
        }
        break;
      case 'phone6':
        if (!formData.phone6) {
          errors.phone6 = 'กรุณากรอกเบอร์โทรศัพท์ 6 หลัก';
        } else if (!/^[0-9]{6}$/.test(formData.phone6)) {
          errors.phone6 = 'เบอร์โทรศัพท์ต้องมี 6 หลัก';
        }
        break;

      case 'IDCard':
        if (!formData.IDCard) {
          errors.IDCard = 'กรุณากรอกเลขบัตรประชาชน';
        } else if (!/^[0-9]{13}$/.test(formData.IDCard)) {
          errors.IDCard = 'เลขบัตรประชาชนต้องมี 13 หลัก';
        }
        break;

      case 'zipcode':
        if (!formData.zipcode) {
          errors.zipcode = 'กรุณาเลือกรหัสไปรษณีย์';
        } else if (!/^[0-9]{5}$/.test(formData.zipcode)) {
          errors.zipcode = 'รหัสไปรษณีย์ต้องมี 5 หลัก';
        }
        break;

      case 'selectedRole':
        if (!formData.selectedRole || formData.selectedRole === 0) {
          errors.selectedRole = 'กรุณาเลือกสิทธิ์ผู้ใช้งาน';
        }
        break;

      case 'birthday':
        if (!formData.birthday) {
          errors.birthday = 'กรุณาเลือกวันเดือนปีเกิด';
        }
        break;

      case 'address':
        if (!formData.address) {
          errors.address = 'กรุณากรอกบ้านเลขที่';
        } else if (!formData.province) {
          errors.address = 'กรุณาเลือกจังหวัด';
        } else if (!formData.amphoe) {
          errors.address = 'กรุณาเลือกอำเภอ';
        } else if (!formData.district) {
          errors.address = 'กรุณาเลือกตำบล';
        }
        // ✅ ลบ else ออก → ถ้ากรอกครบจะไม่มี error
        break;

      default:
        break;
    }
  });

  return errors;
};

export const validateEditUserForm = (formData: FormEditUserData): FormEditUserDataErrors => {
  const errors: FormEditUserDataErrors = {};
  Object.keys(formData).forEach((field) => {
    switch (field) {
      case 'pname':
        if (!formData.pname) {
          errors.pname = 'กรุณากรอกคำนำหน้าชื่อ ';
        }
        break;

      case 'fname':
        if (!formData.fname) {
          errors.fname = 'กรุณากรอกชื่อจริง';
        }
        break;

      case 'lname':
        if (!formData.lname) {
          errors.lname = 'กรุณากรอกนามสกุล';
        }
        break;

      case 'email':
        if (!formData.email) {
          errors.email = 'กรุณากรอกอีเมล';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        break;
      case 'phone':
        if (!formData.phone) {
          errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^0[0-9]{9}$/.test(formData.phone)) {
          errors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก และขึ้นต้นด้วย 0';
        }
        break;
      case 'phone6':
        if (!formData.phone6) {
          errors.phone6 = 'กรุณากรอกเบอร์โทรศัพท์ 6 หลัก';
        } else if (!/^[0-9]{6}$/.test(formData.phone6)) {
          errors.phone6 = 'เบอร์โทรศัพท์ต้องมี 6 หลัก';
        }
        break;
      case 'IDCard':
        if (!formData.IDCard) {
          errors.IDCard = 'กรุณากรอกเลขบัตรประชาชน';
        } else if (!/^[0-9]{13}$/.test(formData.IDCard)) {
          errors.IDCard = 'เลขบัตรประชาชนต้องมี 13 หลัก';
        }
        break;

      case 'zipcode':
        if (!formData.zipcode) {
          errors.zipcode = 'กรุณากรอกรหัสไปรษณีย์';
        } else if (!/^[0-9]{5}$/.test(formData.zipcode)) {
          errors.zipcode = 'รหัสไปรษณีย์ต้องมี 5 หลัก';
        }
        break;

      case 'selectedRole':
        if (!formData.selectedRole || formData.selectedRole === 0) {
          errors.selectedRole = 'กรุณาเลือกสิทธิ์ผู้ใช้งาน';
        }
        break;

      case 'birthday':
        if (!formData.birthday) {
          errors.birthday = 'กรุณาเลือกวันเดือนปีเกิด';
        }
        break;

    case 'address':
        if (!formData.address) {
          errors.address = 'กรุณากรอกบ้านเลขที่';
        } else if (!formData.province) {
          errors.address = 'กรุณาเลือกจังหวัด';
        } else if (!formData.amphoe) {
          errors.address = 'กรุณาเลือกอำเภอ';
        } else if (!formData.district) {
          errors.address = 'กรุณาเลือกตำบล';
        }
        // ✅ ลบ else ออก → ถ้ากรอกครบจะไม่มี error
        break;
      default:
        break;
    }
  });

  return errors;
};

export const validateProfileForm = (formData: FormProfileData): FormProfileDataErrors => {
  const errors: FormProfileDataErrors = {};
  Object.keys(formData).forEach((field) => {
    switch (field) {
      case 'pname':
        if (!formData.pname) {
          errors.pname = 'กรุณากรอกคำนำหน้าชื่อ ';
        }
        break;
      case 'fname':
        if (!formData.fname) {
          errors.fname = 'กรุณากรอกชื่อจริง';
        }
        break;
      case 'lname':
        if (!formData.lname) {
          errors.lname = 'กรุณากรอกนามสกุล';
        }
        break;

      case 'email':
        if (!formData.email) {
          errors.email = 'กรุณากรอกอีเมล';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        break;
      case 'phone':
        if (!formData.phone) {
          errors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^0[0-9]{9}$/.test(formData.phone)) {
          errors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก และขึ้นต้นด้วย 0';
        }
        break;
      case 'phone6':
        if (!formData.phone6) {
          errors.phone6 = 'กรุณากรอกเบอร์โทรศัพท์ 6 หลัก';
        } else if (!/^[0-9]{6}$/.test(formData.phone6)) {
          errors.phone6 = 'เบอร์โทรศัพท์ต้องมี 6 หลัก';
        }
        break;

      case 'IDCard':
        if (!formData.IDCard) {
          errors.IDCard = 'กรุณากรอกเลขบัตรประชาชน';
        } else if (!/^[0-9]{13}$/.test(formData.IDCard)) {
          errors.IDCard = 'เลขบัตรประชาชนต้องมี 13 หลัก';
        }
        break;

      case 'zipcode':
        if (!formData.zipcode) {
          errors.zipcode = 'กรุณากรอกรหัสไปรษณีย์';
        } else if (!/^[0-9]{5}$/.test(formData.zipcode)) {
          errors.zipcode = 'รหัสไปรษณีย์ต้องมี 5 หลัก';
        }
        break;
      case 'birthday':
        if (!formData.birthday) {
          errors.birthday = 'กรุณาเลือกวันเดือนปีเกิด';
        }
        break;

      case 'address':
        if (!formData.address) {
          errors.address = 'กรุณากรอกบ้านเลขที่';
        } else if (!formData.province) {
          errors.address = 'กรุณาเลือกจังหวัด';
        } else if (!formData.amphoe) {
          errors.address = 'กรุณาเลือกอำเภอ';
        } else if (!formData.district) {
          errors.address = 'กรุณาเลือกตำบล';
        }
        // ✅ ลบ else ออก → ถ้ากรอกครบจะไม่มี error
        break;
      default:
        break;
    }
  });

  return errors;
};

export const validataChangePasswordForm = (formData: ForChangePassword): ForChangePasswordErrors => {
  const errors: ForChangePasswordErrors = {};
  Object.keys(formData).forEach((field) => {
    switch (field) {
      case 'passwordOld':
        if (!formData.passwordOld) {
          errors.passwordOld = 'กรุณากรอกรหัสผ่านเดิม'
        }
        break;
      case 'passwordNew':
        if (!formData.passwordNew) {
          errors.passwordNew = 'กรุณากรอกรหัสผ่านใหม่'
        }
        break;
      case 'passwordConform':
        if (!formData.passwordConform) {
          errors.passwordConform = 'กรุณากรอกยืนยันรหัสผ่านใหม่'
        } else if (formData.passwordNew !== formData.passwordConform) {
          errors.passwordConform = 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน'
        }
        break;
    }
  })
  return errors;
}


//banner
export const validataBannerForm = (formData: FormBannerData): FormBannerDataErrors => {
  const errors: FormBannerDataErrors = {};
  const maxFileSize = 4 * 1024 * 1024;
  Object.keys(formData).forEach((field) => {
    switch (field) {
      case 'brandername':
        if (!formData.brandername) {
          errors.brandername = 'กรุณากรอกชื่อแบนเนอร์';
        }
        break;
      case 'picturePC':
        if (!formData.picturePC) {
          errors.picturePC = 'กรุณากรอกอัปโหลดรูปแบนเนอร์ขนาดเดสก์ท็อป';
        } else if (formData.picturePC instanceof File && formData.picturePC.size > maxFileSize) {
          errors.picturePC = 'ขนาดไฟล์ต้องไม่เกิน 4 MB';
        }
        break;
      case 'pictureMoblie':
        if (!formData.pictureMoblie) {
          errors.pictureMoblie = 'กรุณาอัปโหลดรูปแบนเนอร์ขนาดโทรศัพท์';
        } else if (formData.pictureMoblie instanceof File && formData.pictureMoblie.size > maxFileSize) {
          errors.pictureMoblie = 'ขนาดไฟล์ต้องไม่เกิน 4 MB';
        }
        break;
      default:
        break;
    }
  })
  return errors;
}

//Topic
export const validataTopicsForm = (formData: FormTopicsData): FormTopicsDataErrors => {
  const errors: FormTopicsDataErrors = {};
  Object.keys(formData).forEach((field) => {
    switch (field) {
      case 'topicnameTH':
        if (!formData.topicnameTH) {
          errors.topicnameTH = 'กรุณากรอกหัวข้อแบบสอบถามภาษาไทย'
        }
        break;
      case 'topicnameEN':
        if (!formData.topicnameEN) {
          errors.topicnameEN = 'กรุณากรอกหัวข้อแบบสอบถามภาษาอังกฤษ'
        }
        break;
      default:
        break;
    }
  })
  return errors;
}