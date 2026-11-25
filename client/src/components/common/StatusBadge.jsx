import { getBookingStatusClass, getBookingStatusLabel, getPaymentStatusClass, getPaymentStatusLabel, getVehicleStatusClass, getVehicleStatusLabel } from '../../utils/helpers'

export const BookingStatusBadge = ({ status }) => (
  <span className={getBookingStatusClass(status)}>{getBookingStatusLabel(status)}</span>
)

export const PaymentStatusBadge = ({ status }) => (
  <span className={getPaymentStatusClass(status)}>{getPaymentStatusLabel(status)}</span>
)

export const VehicleStatusBadge = ({ status }) => (
  <span className={getVehicleStatusClass(status)}>{getVehicleStatusLabel(status)}</span>
)
