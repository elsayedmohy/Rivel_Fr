/** GET/PUT /api/profile/me */
export interface ProfileDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phoneNumber: string | null;
  readonly role: string;
  readonly emailConfirmed: boolean;
  readonly companyName: string | null;
  readonly bio: string | null;
}

/** PUT /api/profile/me — companyName/bio are carrier-only */
export interface UpdateProfileDto {
  readonly name: string;
  readonly phoneNumber: string | null;
  readonly companyName?: string | null;
  readonly bio?: string | null;
}

/** POST /api/profile/change-password */
export interface ChangePasswordDto {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export interface ContactDto {
  readonly name: string;
  readonly phoneNumber: string | null;
  readonly email: string;
}

/** GET /api/carriers/{userId} — never contains phone/email */
export interface CarrierPublicProfileDto {
  readonly userId: string;
  readonly companyName: string;
  readonly bio: string | null;
  readonly overallRating: number;
  readonly ratingCount: number;
  readonly completedShipments: number;
  readonly vesselCount: number;
  readonly activeRoutes: readonly { readonly originName: string; readonly destinationName: string }[];
}
