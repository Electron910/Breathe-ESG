import csv
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseParser(ABC):
    def __init__(self, batch, file_path):
        self.batch = batch
        self.file_path = file_path
        self.tenant = batch.tenant
        
    def detect_encoding(self):
        # simple fallback logic
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                f.read(1024)
            return 'utf-8'
        except UnicodeDecodeError:
            return 'latin-1'
            
    def parse(self):
        encoding = self.detect_encoding()
        delimiter = self.get_delimiter()
        records = []
        with open(self.file_path, 'r', encoding=encoding) as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            for raw_row in reader:
                try:
                    record_data = self.process_row(raw_row)
                    records.append(record_data)
                except Exception as e:
                    records.append({
                        'status': 'ERROR',
                        'flag_reason': str(e),
                        'raw_row': raw_row
                    })
        return records
        
    @abstractmethod
    def get_delimiter(self) -> str:
        pass
        
    @abstractmethod
    def process_row(self, raw_row: Dict[str, str]) -> Dict[str, Any]:
        pass
