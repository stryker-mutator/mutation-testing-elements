document.querySelector('mutation-test-report-app').report = {
  "schemaVersion": "2.0",
  "thresholds": {
    "high": 80,
    "low": 60
  },
  "files": {
    "app\\service\\friend_service.py": {
      "language": "python",
      "source": "import requests\nfrom typing import Dict, Any\n\nclass FriendService:\n    def __init__(self, base_url: str = \"https://randomuser.me/api/\"):\n        self.base_url = base_url\n\n    def get_random_friend(self) -> Dict[str, Any]:\n        try:\n            data = self.get_friend_from_randomuser_api()\n            \n            # First check if 'results' key exists\n            if 'results' not in data:\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\n                \n            # Then check if results is empty\n            if len(data['results']) == 0:\n                raise Exception(\"Failed to fetch user data: Empty response\")\n                \n            return data['results'][0]\n        except requests.RequestException as e:\n            raise Exception(f\"Failed to fetch user data: {str(e)}\")\n        except (KeyError, IndexError) as e:\n            raise Exception(\"Failed to fetch user data: Invalid response format\") \n\n    def get_friend_from_randomuser_api(self):\n        response = requests.get(self.base_url)\n        response.raise_for_status()\n        data = response.json()\n        return data",
      "mutants": [
        {
          "id": "46ecd510e2bd4272a58b98e52507fb4c",
          "mutatorName": "core/ReplaceComparisonOperator_Eq_NotEq",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/ReplaceComparisonOperator_Eq_NotEq",
          "replacement": "if len(data['results']) != 0:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F.F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000019C5E793230>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x0000019C5E793230>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if len(data['results']) != 0:\r\n>               raise Exception(\"Failed to fetch user data: Empty response\")\r\nE               Exception: Failed to fetch user data: Empty response\r\n\r\napp\\service\friend_service.py:18: Exception\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000019C5EFE9370>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 2 failed, 6 passed in 0.29s =========================\n--- diff available ---"
        },
        {
          "id": "b0d3969fafb34002bb16e800bfbc1ef6",
          "mutatorName": "core/ReplaceComparisonOperator_Eq_Lt",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/ReplaceComparisonOperator_Eq_Lt",
          "replacement": "if len(data['results']) < 0:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py ...F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000002C5E8028FE0>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 1 failed, 7 passed in 0.31s =========================\n--- diff available ---"
        },
        {
          "id": "49be1d7433eb4989b5f563ba99141436",
          "mutatorName": "core/ReplaceComparisonOperator_Eq_LtE",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Survived",
          "description": "core/ReplaceComparisonOperator_Eq_LtE",
          "replacement": "if len(data['results']) <= 0:"
        },
        {
          "id": "1f09531c8a3a47028030f18d465af814",
          "mutatorName": "core/ReplaceComparisonOperator_Eq_Gt",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/ReplaceComparisonOperator_Eq_Gt",
          "replacement": "if len(data['results']) > 0:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F.F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001FB298B2ED0>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x000001FB298B2ED0>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if len(data['results']) > 0:\r\n>               raise Exception(\"Failed to fetch user data: Empty response\")\r\nE               Exception: Failed to fetch user data: Empty response\r\n\r\napp\\service\friend_service.py:18: Exception\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001FB2A0B92E0>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 2 failed, 6 passed in 0.26s =========================\n--- diff available ---"
        },
        {
          "id": "69b3b0ebd80e411283f87bee5f810e1b",
          "mutatorName": "core/ReplaceComparisonOperator_Eq_GtE",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/ReplaceComparisonOperator_Eq_GtE",
          "replacement": "if len(data['results']) >= 0:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F...                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000022EA795B6B0>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x0000022EA795B6B0>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if len(data['results']) >= 0:\r\n>               raise Exception(\"Failed to fetch user data: Empty response\")\r\nE               Exception: Failed to fetch user data: Empty response\r\n\r\napp\\service\friend_service.py:18: Exception\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\n========================= 1 failed, 7 passed in 0.54s =========================\n--- diff available ---"
        },
        {
          "id": "f6a1a1933bdd4f3488c72ac8ab4cde9c",
          "mutatorName": "core/AddNot",
          "location": {
            "start": {
              "line": 13,
              "column": 13
            },
            "end": {
              "line": 13,
              "column": 38
            }
          },
          "status": "Killed",
          "description": "core/AddNot",
          "replacement": "if not 'results' not in data:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F.F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000026090DED970>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x0000026090DED970>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if not 'results' not in data:\r\n>               raise Exception(\"Failed to fetch user data: Invalid response format\")\r\nE               Exception: Failed to fetch user data: Invalid response format\r\n\r\napp\\service\friend_service.py:14: Exception\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000026091149340>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 2 failed, 6 passed in 0.29s =========================\n--- diff available ---"
        },
        {
          "id": "5de89b5d19e746bda42807f9f02d5404",
          "mutatorName": "core/AddNot",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/AddNot",
          "replacement": "if not len(data['results']) == 0:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F.F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001F1DC2EB7D0>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x000001F1DC2EB7D0>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if not len(data['results']) == 0:\r\n>               raise Exception(\"Failed to fetch user data: Empty response\")\r\nE               Exception: Failed to fetch user data: Empty response\r\n\r\napp\\service\friend_service.py:18: Exception\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001F1DC339490>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 2 failed, 6 passed in 0.25s =========================\n--- diff available ---"
        },
        {
          "id": "1bd5c98711ad4cc4b52f91d7f1b29557",
          "mutatorName": "core/ExceptionReplacer",
          "location": {
            "start": {
              "line": 21,
              "column": 9
            },
            "end": {
              "line": 21,
              "column": 47
            }
          },
          "status": "Killed",
          "description": "core/ExceptionReplacer",
          "replacement": "except requestsCosmicRayTestingExceptionRequestException as e:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py ..FFF                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n____________________ test_get_random_friend_request_error _____________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001E13B7F3890>\r\n\r\n    def test_get_random_friend_request_error(friend_service):\r\n        with patch('requests.get', side_effect=requests.RequestException(\"Connection error\")):\r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Connection error\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Connection error' in \"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\"\r\nE            +  where \"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\" = str(NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\"))\r\nE            +    where NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\") = <ExceptionInfo NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:40: AssertionError\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001E13B16CF20>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Empty response' in \"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\"\r\nE            +  where \"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\" = str(NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\"))\r\nE            +    where NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\") = <ExceptionInfo NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n____________________ test_get_random_friend_invalid_format ____________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001E13B9EA6F0>\r\n\r\n    def test_get_random_friend_invalid_format(friend_service):\r\n        mock_response = {\"wrong_key\": []}  # Missing 'results' key\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Invalid response format\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Invalid response format' in \"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\"\r\nE            +  where \"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\" = str(NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\"))\r\nE            +    where NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\") = <ExceptionInfo NameError(\"name 'requestsCosmicRayTestingExceptionRequestException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:62: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_request_error\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_format\r\n========================= 3 failed, 5 passed in 0.26s =========================\n--- diff available ---"
        },
        {
          "id": "cab993c27de14a64b4a42c9689bfe6b9",
          "mutatorName": "core/ExceptionReplacer",
          "location": {
            "start": {
              "line": 23,
              "column": 9
            },
            "end": {
              "line": 23,
              "column": 44
            }
          },
          "status": "Killed",
          "description": "core/ExceptionReplacer",
          "replacement": "except (CosmicRayTestingException, IndexError) as e:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py ...FF                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000016831D49010>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Empty response' in \"name 'CosmicRayTestingException' is not defined\"\r\nE            +  where \"name 'CosmicRayTestingException' is not defined\" = str(NameError(\"name 'CosmicRayTestingException' is not defined\"))\r\nE            +    where NameError(\"name 'CosmicRayTestingException' is not defined\") = <ExceptionInfo NameError(\"name 'CosmicRayTestingException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n____________________ test_get_random_friend_invalid_format ____________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000016831D2B770>\r\n\r\n    def test_get_random_friend_invalid_format(friend_service):\r\n        mock_response = {\"wrong_key\": []}  # Missing 'results' key\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Invalid response format\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Invalid response format' in \"name 'CosmicRayTestingException' is not defined\"\r\nE            +  where \"name 'CosmicRayTestingException' is not defined\" = str(NameError(\"name 'CosmicRayTestingException' is not defined\"))\r\nE            +    where NameError(\"name 'CosmicRayTestingException' is not defined\") = <ExceptionInfo NameError(\"name 'CosmicRayTestingException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:62: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_format\r\n========================= 2 failed, 6 passed in 0.30s =========================\n--- diff available ---"
        },
        {
          "id": "21d4105408714098ae413820fc569388",
          "mutatorName": "core/ExceptionReplacer",
          "location": {
            "start": {
              "line": 23,
              "column": 9
            },
            "end": {
              "line": 23,
              "column": 44
            }
          },
          "status": "Killed",
          "description": "core/ExceptionReplacer",
          "replacement": "except (KeyError, CosmicRayTestingException) as e:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py ...FF                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000020C48298CE0>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Empty response' in \"name 'CosmicRayTestingException' is not defined\"\r\nE            +  where \"name 'CosmicRayTestingException' is not defined\" = str(NameError(\"name 'CosmicRayTestingException' is not defined\"))\r\nE            +    where NameError(\"name 'CosmicRayTestingException' is not defined\") = <ExceptionInfo NameError(\"name 'CosmicRayTestingException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n____________________ test_get_random_friend_invalid_format ____________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x0000020C4827A210>\r\n\r\n    def test_get_random_friend_invalid_format(friend_service):\r\n        mock_response = {\"wrong_key\": []}  # Missing 'results' key\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Invalid response format\" in str(exc_info.value)\r\nE           assert 'Failed to fetch user data: Invalid response format' in \"name 'CosmicRayTestingException' is not defined\"\r\nE            +  where \"name 'CosmicRayTestingException' is not defined\" = str(NameError(\"name 'CosmicRayTestingException' is not defined\"))\r\nE            +    where NameError(\"name 'CosmicRayTestingException' is not defined\") = <ExceptionInfo NameError(\"name 'CosmicRayTestingException' is not defined\") tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:62: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_format\r\n========================= 2 failed, 6 passed in 0.27s =========================\n--- diff available ---"
        },
        {
          "id": "2b913b5b046e45d292139c7f63bd9493",
          "mutatorName": "core/NumberReplacer",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/NumberReplacer",
          "replacement": "if len(data['results']) == 1:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F.F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001EFA5DFC7D0>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x000001EFA5DFC7D0>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if len(data['results']) == 1:\r\n>               raise Exception(\"Failed to fetch user data: Empty response\")\r\nE               Exception: Failed to fetch user data: Empty response\r\n\r\napp\\service\friend_service.py:18: Exception\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001EFA6599040>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 2 failed, 6 passed in 0.28s =========================\n--- diff available ---"
        },
        {
          "id": "d8e216c6c4bd4297ab4b1cfb1893b3a0",
          "mutatorName": "core/NumberReplacer",
          "location": {
            "start": {
              "line": 17,
              "column": 13
            },
            "end": {
              "line": 17,
              "column": 42
            }
          },
          "status": "Killed",
          "description": "core/NumberReplacer",
          "replacement": "if len(data['results']) == -1:",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py ...F.                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n___________________ test_get_random_friend_invalid_response ___________________\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x000001B5DA639040>\r\n\r\n    def test_get_random_friend_invalid_response(friend_service):\r\n        mock_response = {\"results\": []}  # Empty results\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n            with pytest.raises(Exception) as exc_info:\r\n                friend_service.get_random_friend()\r\n>           assert \"Failed to fetch user data: Empty response\" in str(exc_info.value)\r\nE           AssertionError: assert 'Failed to fetch user data: Empty response' in 'Failed to fetch user data: Invalid response format'\r\nE            +  where 'Failed to fetch user data: Invalid response format' = str(Exception('Failed to fetch user data: Invalid response format'))\r\nE            +    where Exception('Failed to fetch user data: Invalid response format') = <ExceptionInfo Exception('Failed to fetch user data: Invalid response format') tblen=2>.value\r\n\r\ntests\\unit est_friend_service.py:51: AssertionError\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_invalid_response\r\n========================= 1 failed, 7 passed in 0.26s =========================\n--- diff available ---"
        },
        {
          "id": "dad0d8df5da7415eaf765615abb3bc78",
          "mutatorName": "core/NumberReplacer",
          "location": {
            "start": {
              "line": 20,
              "column": 13
            },
            "end": {
              "line": 20,
              "column": 38
            }
          },
          "status": "Killed",
          "description": "core/NumberReplacer",
          "replacement": "return data['results'][ 1]",
          "statusReason": "============================= test session starts =============================\r\nplatform win32 -- Python 3.12.7, pytest-8.0.1, pluggy-1.4.0\r\nrootdir: D:\\source-codes\\ampyard ech-savvy\friend-app\r\nplugins: cov-6.0.0, html-4.1.1, json-ctrf-0.3.5, metadata-3.1.1\r\ncollected 8 items\r\n\r\ntests\\unit est_friend_service.py .F...                                  [ 62%]\r\ntests\\unit est_util_database.py ...                                     [100%]\r\n\r\n================================== FAILURES ===================================\r\n_______________________ test_get_random_friend_success ________________________\r\n\r\nself = <app.service.friend_service.FriendService object at 0x00000161BAA7C830>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if len(data['results']) == 0:\r\n                raise Exception(\"Failed to fetch user data: Empty response\")\r\n    \r\n>           return data['results'][ 1]\r\nE           IndexError: list index out of range\r\n\r\napp\\service\friend_service.py:20: IndexError\r\n\r\nDuring handling of the above exception, another exception occurred:\r\n\r\nfriend_service = <app.service.friend_service.FriendService object at 0x00000161BAA7C830>\r\n\r\n    def test_get_random_friend_success(friend_service):\r\n        mock_response = {\r\n            \"results\": [{\r\n                \"name\": {\"first\": \"John\", \"last\": \"Doe\"},\r\n                \"email\": \"john@example.com\",\r\n                \"picture\": {\"large\": \"https://example.com/photo.jpg\"}\r\n            }]\r\n        }\r\n    \r\n        with patch('requests.get') as mock_get:\r\n            mock_get.return_value.json.return_value = mock_response\r\n            mock_get.return_value.raise_for_status.return_value = None\r\n    \r\n>           user_data = friend_service.get_random_friend()\r\n\r\ntests\\unit est_friend_service.py:32: \r\n_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _\r\n\r\nself = <app.service.friend_service.FriendService object at 0x00000161BAA7C830>\r\n\r\n    def get_random_friend(self) -> Dict[str, Any]:\r\n        try:\r\n            data = self.get_friend_from_randomuser_api()\r\n    \r\n            # First check if 'results' key exists\r\n            if 'results' not in data:\r\n                raise Exception(\"Failed to fetch user data: Invalid response format\")\r\n    \r\n            # Then check if results is empty\r\n            if len(data['results']) == 0:\r\n                raise Exception(\"Failed to fetch user data: Empty response\")\r\n    \r\n            return data['results'][ 1]\r\n        except requests.RequestException as e:\r\n            raise Exception(f\"Failed to fetch user data: {str(e)}\")\r\n        except (KeyError, IndexError) as e:\r\n>           raise Exception(\"Failed to fetch user data: Invalid response format\")\r\nE           Exception: Failed to fetch user data: Invalid response format\r\n\r\napp\\service\friend_service.py:24: Exception\r\n=========================== short test summary info ===========================\r\nFAILED tests/unit/test_friend_service.py::test_get_random_friend_success - Ex...\r\n========================= 1 failed, 7 passed in 0.33s =========================\n--- diff available ---"
        },
        {
          "id": "763416564bfa4d8f8055c61d11223e8c",
          "mutatorName": "core/NumberReplacer",
          "location": {
            "start": {
              "line": 20,
              "column": 13
            },
            "end": {
              "line": 20,
              "column": 38
            }
          },
          "status": "Survived",
          "description": "core/NumberReplacer",
          "replacement": "return data['results'][ -1]"
        }
      ]
    },
    "app\\routes.py": {
      "language": "python",
      "source": "from flask import Blueprint, render_template, jsonify, request\nfrom app.service.task_service import TaskService\nfrom app.service.friend_service import FriendService\n\nmain = Blueprint('main', __name__)\n\ntask_service = TaskService()\nfriend_service = FriendService()\n@main.route('/')\ndef index():\n    try:\n        user_data = friend_service.get_random_friend()\n        return render_template('index.html', user=user_data)\n    except Exception as e:\n        return render_template('index.html', error=str(e))\n\n@main.route('/api/tasks')\ndef get_tasks():\n    try:\n        tasks = task_service.get_tasks()\n        return jsonify(tasks)\n    except Exception as e:\n        return jsonify({'error': str(e)}), 500\n\n",
      "mutants": [
        {
          "id": "f73da0bea5824cc0b046248c4e09170c",
          "mutatorName": "core/ExceptionReplacer",
          "location": {
            "start": {
              "line": 14,
              "column": 5
            },
            "end": {
              "line": 14,
              "column": 27
            }
          },
          "status": "Survived",
          "description": "core/ExceptionReplacer",
          "replacement": "except CosmicRayTestingException as e:"
        },
        {
          "id": "e6fc08944263401a9c12a1e45783834e",
          "mutatorName": "core/ExceptionReplacer",
          "location": {
            "start": {
              "line": 22,
              "column": 5
            },
            "end": {
              "line": 22,
              "column": 27
            }
          },
          "status": "Survived",
          "description": "core/ExceptionReplacer",
          "replacement": "except CosmicRayTestingException as e:"
        },
        {
          "id": "7c94181504f94ffc9fcc184b8c4bfe2d",
          "mutatorName": "core/NumberReplacer",
          "location": {
            "start": {
              "line": 23,
              "column": 9
            },
            "end": {
              "line": 23,
              "column": 47
            }
          },
          "status": "Survived",
          "description": "core/NumberReplacer",
          "replacement": "return jsonify({'error': str(e)}), 501"
        },
        {
          "id": "61ca43dd1cd0476b87172a75e9869ec1",
          "mutatorName": "core/NumberReplacer",
          "location": {
            "start": {
              "line": 23,
              "column": 9
            },
            "end": {
              "line": 23,
              "column": 47
            }
          },
          "status": "Survived",
          "description": "core/NumberReplacer",
          "replacement": "return jsonify({'error': str(e)}), 499"
        },
        {
          "id": "9eb40b20bbb94db99a80440eba540482",
          "mutatorName": "core/RemoveDecorator",
          "location": {
            "start": {
              "line": 9,
              "column": 1
            },
            "end": {
              "line": 10,
              "column": 13
            }
          },
          "status": "Survived",
          "description": "core/RemoveDecorator",
          "replacement": " "
        },
        {
          "id": "1eeb246d4ca3453f8e3cf5b7c639a687",
          "mutatorName": "core/RemoveDecorator",
          "location": {
            "start": {
              "line": 17,
              "column": 1
            },
            "end": {
              "line": 18,
              "column": 17
            }
          },
          "status": "Survived",
          "description": "core/RemoveDecorator",
          "replacement": " "
        }
      ]
    }
  }
}