import re
from typing import Union

class VersionProcessor:
    @staticmethod
    def extract_numeric_version(version_str: str) -> Union[int, float]:
        """
        Extract numeric version from a string like 'v1.0' -> 1 or 'v2.3' -> 2.3 
        """

        if not version_str:
            return 1 
        
        #to remove 'v' if present 
        clean_version = version_str.lower().replace('v', '').strip()

        try:
            #

