pragma solidity ^0.8.13;

contract Application {
    ApplicationType[] public applications;

    struct ObjectType {
        uint256 id;
        string name;
        FieldType[] fields;
    }

    struct FieldType {
        uint256 id;
        string name;
        string fieldType;
    }

    struct ParamType {
        uint256 id;
        string name;
        string paramType;
    }

    struct FunctionType {
        uint256 id;
        string name;
        string action;
        ParamType[] parameters;
        string[] targetParams;
        ObjectType target;
    }

    struct ApplicationType {
        uint256 id;
        string name;
        address creator;
        uint256 timestamp;
        string contractId;
        ObjectType[] objects;
        FunctionType[] functions;
    }

    function newApplication(string memory appName) public {
        applications.push();
        uint256 newIndex = applications.length - 1;

        applications[newIndex].id = applications.length - 1;
        applications[newIndex].name = appName;
        applications[newIndex].creator = msg.sender;
        applications[newIndex].timestamp = block.timestamp;
    }

    function updateContract(uint256 id, string memory newContract) public {
        applications[id].contractId = newContract;
    }

    function getAllApplications() public returns(ApplicationType[] memory) {
        return applications;
    }

    function addObjectToApplication(uint256 id, string memory objName) public {
        applications[id].objects.push();
        uint256 newIndex = applications[id].objects.length - 1;

        applications[id].objects[newIndex].id = applications[id].objects.length - 1;
        applications[id].objects[newIndex].name = objName;
    }

    function addMultipleFieldsToObject(uint256 applicationId, uint256 objId, string[] memory fieldNames, string[] memory fieldTypes) public {
        for (uint i = 0; i < fieldNames.length; i++) {
            applications[applicationId].objects[objId].fields.push();
            uint256 newIndex = applications[applicationId].objects[objId].fields.length - 1;

            applications[applicationId].objects[objId].fields[newIndex].id = newIndex;
            applications[applicationId].objects[objId].fields[newIndex].name = fieldNames[i];
            applications[applicationId].objects[objId].fields[newIndex].fieldType = fieldTypes[i];
        }
    }

    function addFunctionToApplication(uint256 id, string memory funcName, string memory action, uint256 targetId, string[] memory paramNames, string[] memory paramTypes, string[] memory targetParams) public {
        applications[id].functions.push();
        uint256 newIndex = applications[id].functions.length - 1;

        applications[id].functions[newIndex].id = applications[id].functions.length - 1;
        applications[id].functions[newIndex].name = funcName;
        applications[id].functions[newIndex].action = action;
        applications[id].functions[newIndex].target = applications[id].objects[targetId];
        applications[id].functions[newIndex].targetParams = targetParams;

        for (uint i = 0; i < paramNames.length; i++) {
            applications[id].functions[newIndex].parameters.push();

            uint256 _newIndex = applications[id].functions[newIndex].parameters.length - 1;

            applications[id].functions[newIndex].parameters[_newIndex].id = _newIndex;
            applications[id].functions[newIndex].parameters[_newIndex].name = paramNames[i];
            applications[id].functions[newIndex].parameters[_newIndex].paramType = paramTypes[i];
        }
    }

    function deleteApplication(uint256 id) public {
        for (uint i = id; i < applications.length-1; i++){
            applications[i] = applications[i+1];
        }
        applications.pop();
    }
}
