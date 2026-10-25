import { ApiError } from '../components/ApiError/ApiError';
import { Loading } from '../components/Loading/Loading';
import { RawJson } from '../components/RawJson/RawJson';
import { useAuth } from '../auth/AuthProvider';

export function ProfilePage() {
  const { profile, profileError, isProfileLoading, refetchProfile } = useAuth();

  return (
    <div className="page">
      <h1>Profile</h1>
      <p className="hint">GET /user/profile</p>
      {isProfileLoading && <Loading />}
      <ApiError error={profileError} onRetry={refetchProfile} />
      {profile && (
        <>
          <dl className="fields">
            <div>
              <dt>Id</dt>
              <dd className="mono">{profile.id}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{profile.name ?? '—'}</dd>
            </div>
            <div>
              <dt>Last name</dt>
              <dd>{profile.last_name ?? '—'}</dd>
            </div>
          </dl>
          <RawJson data={profile} />
        </>
      )}
    </div>
  );
}
