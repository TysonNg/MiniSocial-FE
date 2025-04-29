export interface UserInterface {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createAt: string;
}

export interface UpdateUserInterface {
  imgUrl: {
    url: string|null;
    publicId: string | null;
  };

  userName: string | null;
  bio: string | null;
}
