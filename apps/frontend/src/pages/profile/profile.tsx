import React from 'react';

import { Loader, Navigate } from '~/libs/components/components.js';
import { AppRoute, DataStatus } from '~/libs/enums/enums.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect
} from '~/libs/hooks/hooks.js';
import { profileActions } from '~/modules/profile/profile.js';

import { ProfileEdit } from './profile-edit.js';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataStatus, profile } = useAppSelector(state => state.profile);

  useEffect(() => {
    void dispatch(profileActions.getProfile());
  }, [dispatch]);

  const handleUpdate = useCallback(
    (data: Record<string, unknown>): void => {
      void dispatch(profileActions.updateProfile(data));
    },
    [dispatch]
  );

  if (dataStatus === DataStatus.PENDING || !profile) {
    return <Loader />;
  }

  const ifNewProfile = profile.createdAt === profile.updatedAt;

  if (ifNewProfile) {
    return (
      <ProfileEdit ifNewProfile onUpdate={handleUpdate} profile={profile} />
    );
  }

  if (dataStatus === DataStatus.REJECTED) {
    return <Navigate replace to={AppRoute.SIGN_IN} />;
  }

  return <ProfileEdit onUpdate={handleUpdate} profile={profile} />;
};

export { Profile };
