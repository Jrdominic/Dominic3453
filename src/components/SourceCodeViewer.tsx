import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Copy, Check, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DownloadProjectButton } from './DownloadProjectButton';
import { projectFiles, ProjectFile } from '@/utils/projectFiles'; // corrected import
// ... (rest of the file remains unchanged)