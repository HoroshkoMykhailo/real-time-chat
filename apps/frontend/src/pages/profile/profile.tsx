import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Loader, Navigate } from '~/libs/components/components.js';
import { AppRoute, DataStatus } from '~/libs/enums/enums.js';
import { checkGreaterThanZero } from '~/libs/helpers/helpers.js';
import {
  useAppDispatch,
  useAppSelector,
  useCallback,
  useEffect
} from '~/libs/hooks/hooks.js';
import { profileActions } from '~/modules/profile/profile.js';

import { ProfileEdit } from './libs/profile-edit/profile-edit.js';
import { ProfileView } from './libs/profile-view/profile-view.js';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { dataStatus, profile } = useAppSelector(state => state.profile);

  useEffect(() => {
    void dispatch(profileActions.getProfile());
  }, [dispatch]);

  const handleUpdate = useCallback(
    (data: Record<string, unknown>): void => {
      if (checkGreaterThanZero(Object.keys(data).length)) {
        void dispatch(profileActions.updateProfile(data));
      }

      setIsEditing(false);
    },
    [dispatch]
  );

  const onEditClick = useCallback((): void => {
    setIsEditing(true);
  }, []);

  const onBackClick = useCallback((): void => {
    navigate(AppRoute.ROOT);
  }, [navigate]);

  const onCancel = useCallback((): void => {
    setIsEditing(false);
  }, []);

  if (dataStatus === DataStatus.PENDING || !profile) {
    return <Loader />;
  }

  const ifNewProfile = profile.createdAt === profile.updatedAt;

  if (ifNewProfile) {
    return (
      <ProfileEdit
        ifNewProfile
        onCancel={onCancel}
        onUpdate={handleUpdate}
        profile={profile}
      />
    );
  }

  if (dataStatus === DataStatus.REJECTED) {
    return <Navigate replace to={AppRoute.SIGN_IN} />;
  }

  return isEditing ? (
    <ProfileEdit
      onCancel={onCancel}
      onUpdate={handleUpdate}
      profile={profile}
    />
  ) : (
    <ProfileView onBack={onBackClick} onEdit={onEditClick} profile={profile} />
  );
};

export { Profile };
