export interface ClientInstalledArea {
  active: boolean;
  activeConnections: number;
  client: { id?: number; uid: string; code?: string };
  createdAt: string;
  gasInstallation: { id?: number; uid: string; name?: string };
  notActiveConnections: number;
  notes: string;
  uid: string;
  updatedAt: string;
}

export interface ClientInstalledAreaDtoInput {
  activeConnections: number;
  clientUid?: string;
  gasInstallationUid: string;
  notActiveConnections: number;
  notes?: string;
  uid?: string;
}
