// “Switch สำหรับเปลี่ยนสถานะการใช้งาน”

"use client";

/* ======================================================
   IMPORT TYPE ที่จำเป็นจาก React
====================================================== */

import type { ChangeEvent } from "react";

/* ======================================================
   IMPORT COMPONENT SWITCH BUTTON
====================================================== */

// Switch Button สำหรับเปิด/ปิดสถานะ
import SwitchButton from "../Buttom/SwitchButton";

/* ======================================================
   TYPE ของ Props ที่ Component รับเข้ามา
====================================================== */

type ActiveStatusSwitchProps = {

  // สถานะเปิด / ปิด ของ switch
  checked: boolean;

  // ปิดการใช้งาน switch
  disabled?: boolean;

  // callback เมื่อมีการเปลี่ยนสถานะ
  onChange: (
    checked: boolean,
    event: ChangeEvent<HTMLInputElement>
  ) => void;
};

/* ======================================================
   COMPONENT : Switch สำหรับเปลี่ยนสถานะ
====================================================== */

const ActiveStatusSwitch = ({
  checked,
  disabled = false,
  onChange,
}: ActiveStatusSwitchProps) => {

  /* ======================================================
     ส่วนแสดงผล UI
  ====================================================== */

  return (

    /* ======================================================
       Switch Button
    ====================================================== */

    <SwitchButton

      // ควบคุมสถานะ checked
      checked={checked}

      // กำหนด disabled
      disabled={disabled}

      // เมื่อมีการเปลี่ยนค่า switch
      handleChange={(event) => {

        // ป้องกัน event bubbling จาก table row
        event.stopPropagation();

        // ส่งค่ากลับไปยัง parent component
        onChange(
          event.target.checked,
          event
        );
      }}
    />
  );
};


export default ActiveStatusSwitch;