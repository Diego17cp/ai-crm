import type { Telefono, TipoTelefono } from "@/core/types";
import { FiPhone } from "react-icons/fi";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { IoLogoWhatsapp } from "react-icons/io"
import { MdOutlineRingVolume } from "react-icons/md"

export const getPhoneIconType = (type: TipoTelefono) => {
  switch (type) {
    case "PERSONAL":
      return HiOutlineDevicePhoneMobile
    case "WHATSAPP":
      return IoLogoWhatsapp
    case "TRABAJO":
      return MdOutlineRingVolume
    default:
      return FiPhone
  }
}

export const getPhoneTypeColor = (type: TipoTelefono) => {
  switch (type) {
    case "PERSONAL":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 border-blue-200 dark:border-blue-500/20"
    case "WHATSAPP":
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30 border-green-200 dark:border-green-500/20"
    case "TRABAJO":
      return "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/30 border-purple-200 dark:border-purple-500/20"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500/30 border-gray-200 dark:border-gray-500/20"
  }
}

export const getPhoneHref = (tel: Telefono) => {
  switch (tel.tipo) {
    case "WHATSAPP":
      return `https://wa.me/${tel.numero}`
    default:
      return `tel:${tel.numero}`
  }
}