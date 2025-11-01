import React from 'react';
import { useTranslation } from 'react-i18next';
import driveService from '../api/drive/driveService';

const DriveUploader: React.FC = () => {
    const { t } = useTranslation();
    const [file, setFile] = React.useState<File | null>(null);
    const [status, setStatus] = React.useState<string | null>(null);
    const [folders, setFolders] = React.useState<Array<any>>([]);
    const [folderId, setFolderId] = React.useState<string | null>(null);
    const [customFolder, setCustomFolder] = React.useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files && e.target.files[0];
        if (f) setFile(f);
    };

    const upload = async () => {
        if (!file) return setStatus(t('drive_uploader.no_file', 'No file selected'));
        setStatus(t('drive_uploader.uploading', 'Uploading...'));
        const fd = new FormData();
        fd.append('file', file, file.name);
        // prefer customFolder if provided, else selected folderId
        const resolvedFolder = (customFolder && customFolder.trim()) ? customFolder.trim() : folderId;
        if (resolvedFolder) {
            // if user pasted a full URL, try to extract ID
            const m = resolvedFolder.match(/[-_a-zA-Z0-9]{25,}/);
            const finalId = m ? m[0] : resolvedFolder;
            fd.append('folderId', finalId);
        }

        try {
            const json = await driveService.uploadFile(fd);
            const meta = { id: json.id, name: json.name, webViewLink: json.webViewLink, uploadedAt: new Date().toISOString() };
            localStorage.setItem('lastUploadedFile', JSON.stringify(meta));
            setStatus(t('drive_uploader.done', 'Upload successful'));
        } catch (err) {
            console.error(err);
            setStatus(t('drive_uploader.error', 'Upload error'));
        }
    };

    React.useEffect(() => {
        const fetchFolders = async () => {
            try {
                const json = await driveService.listFolders();
                setFolders(json.files || []);
            } catch (err) {
                console.error('Could not fetch folders', err);
            }
        };
        fetchFolders();
    }, []);

    return (
        <div className="p-4 border rounded">
            <div className="mb-2">{t('drive_uploader.title', 'Upload PDF to Google Drive')}</div>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            <div className="mt-2">
                <div className="mb-2">{t('drive_uploader.select_folder', 'Select Drive folder (or paste folder ID/URL)')}</div>
                <select className="mb-2" value={folderId ?? ''} onChange={e => setFolderId(e.target.value || null)}>
                    <option value="">-- {t('drive_uploader.none', 'None')} --</option>
                    {folders.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                    ))}
                </select>
                <div className="mb-2">
                    <input placeholder={t('drive_uploader.paste_folder', 'Paste folder ID or full URL here')} className="w-full" value={customFolder} onChange={e => setCustomFolder(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={upload}>{t('common.upload', 'Upload')}</button>
                    <button className="btn" onClick={() => { setFile(null); setStatus(null); localStorage.removeItem('lastUploadedFile'); }}>{t('drive_uploader.clear', 'Clear')}</button>
                    <button className="btn btn-outline-secondary" onClick={() => {
                        const resolved = (customFolder && customFolder.trim()) ? customFolder.trim() : folderId;
                        if (!resolved) {
                            setStatus(t('drive_uploader.set_default_no_folder', 'No folder selected to set as default'));
                            return;
                        }
                        const m = resolved.match(/[-_a-zA-Z0-9]{25,}/);
                        const finalId = m ? m[0] : resolved;
                        localStorage.setItem('drive:defaultFolderId', finalId);
                        setStatus(t('drive_uploader.set_default_done', 'Default folder saved'));
                    }}>{t('drive_uploader.set_default', 'Set as default')}</button>
                </div>
            </div>
            {status && <div className="mt-2">{status}</div>}
            <LastUploadedInline />
        </div>
    );
};

const LastUploadedInline: React.FC = () => {
    const [meta, setMeta] = React.useState<any>(() => {
        try {
            const raw = localStorage.getItem('lastUploadedFile');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    });

    if (!meta) return null;
    return (
        <div className="mt-3 text-sm">
            <div>Last: {meta.name}</div>
            <a href={meta.webViewLink ?? `https://drive.google.com/file/d/${meta.id}/view`} target="_blank" rel="noreferrer">Open in Drive</a>
            <div>{new Date(meta.uploadedAt).toLocaleString()}</div>
        </div>
    );
};

export default DriveUploader;
