export interface CAListing {
  id: string;
  initials: string;
  name: string;
  verified: boolean;
  sponsored: boolean;
  specialty: string;
  yearsExperience: number;
  rating: number;
  commissionToPaisaEra: number;
  bookingPrice: number;
}

export const CA_LISTINGS: CAListing[] = [
  {
    id: 'nikhil-kulkarni',
    initials: 'NK',
    name: 'CA Nikhil Kulkarni',
    verified: true,
    sponsored: false,
    specialty: 'Tax & ITR',
    yearsExperience: 8,
    rating: 4.9,
    commissionToPaisaEra: 200,
    bookingPrice: 1499,
  },
  {
    id: 'riya-shah',
    initials: 'RS',
    name: 'CA Riya Shah',
    verified: true,
    sponsored: true,
    specialty: 'GST & small biz',
    yearsExperience: 6,
    rating: 4.8,
    commissionToPaisaEra: 250,
    bookingPrice: 1999,
  },
];
